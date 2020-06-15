'use strict';

/* eslint no-await-in-loop: off */

import {
  readdir as fsReaddir,
  rename as fsRename,
  existsSync,
  statSync,
  lstatSync
} from 'fs';
import Promise from 'bluebird';
import junk from 'junk';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';
import path from 'path';
import moment from 'moment';
import { spawn, exec } from 'child_process';
import findLodash from 'lodash/find';
import { log } from '../../utils/log';
import { mtp as _mtpCli } from '../../utils/binaries';

import { DEVICES_LABEL, DEVICES_TYPE_CONST } from '../../constants';
import { baseName, getExtension } from '../../utils/paths';
import {
  clearFileTransfer,
  fetchDirList,
  processMtpOutput,
  setFileTransferProgress
} from '../../containers/HomePage/actions';
import {
  niceBytes,
  percentage,
  splitIntoLines,
  truncate,
  isArray,
  undefinedOrNull
} from '../../utils/funcs';
import { msToTime, unixTimestampNow } from '../../utils/date';

const readdir = Promise.promisify(fsReaddir);
const execPromise = Promise.promisify(exec);

/**
 * This hack is to support flex quotes parser for mtp cli.
 */
export const escapeShellMtp = cmd => {
  if (cmd.indexOf(`\\"`) !== -1 && cmd.indexOf(`"\\`) !== -1) {
    return cmd
      .replace(/`/g, '\\`')
      .replace(/\\/g, `\\\\\\\\`)
      .replace(/"/g, `\\\\\\"`);
  }
  if (cmd.indexOf(`"\\"`) !== -1) {
    return cmd
      .replace(/`/g, '\\`')
      .replace(/\\/g, `\\\\\\\\`)
      .replace(/"/g, `\\\\\\"`);
  }
  if (cmd.indexOf(`\\"`) !== -1) {
    return cmd
      .replace(/`/g, '\\`')
      .replace(/\\/g, `\\\\\\`)
      .replace(/"/g, `\\\\\\\\"`);
  }
  if (cmd.indexOf(`"\\`) !== -1) {
    return cmd
      .replace(/`/g, '\\`')
      .replace(/\\/g, `\\\\\\\\`)
      .replace(/"/g, `\\\\\\"`);
  }
  return cmd
    .replace(/`/g, '\\`')
    .replace(/\\/g, `\\\\\\`)
    .replace(/"/g, `\\\\\\"`);
};

const mtpCli = `"${escapeShellMtp(_mtpCli)}"`;

const filterOutMtpLines = (string, index) => {
  return (
    filterJunkMtpErrors(string) ||
    (index < 2 && string.toLowerCase().indexOf(`selected storage`) !== -1)
  );
};

const filterJunkMtpErrors = string => {
  return (
    string === '\n' ||
    string === '\r\n' ||
    string === '' ||
    string.toLowerCase().indexOf(`device::find failed`) !== -1 ||
    string.toLowerCase().indexOf(`iocreateplugininterfaceforservice`) !== -1 ||
    string.toLowerCase().indexOf(`Device::Find failed`) !== -1
  );
};

const cleanJunkMtpError = ({ error = null, stdout = null, stderr = null }) => {
  const splittedError = splitIntoLines(error);
  const filteredError = splittedError
    ? splittedError.filter(a => !filterJunkMtpErrors(a))
    : [];

  const splittedStderr = splitIntoLines(stderr);
  const filteredStderr = splittedStderr
    ? splittedStderr.filter(a => !filterJunkMtpErrors(a))
    : [];

  return {
    filteredError,
    filteredStderr,
    filteredStdout: stdout
  };
};

const promisifiedExec = command => {
  try {
    return new Promise(resolve => {
      execPromise(command, (error, stdout, stderr) => {
        const {
          filteredStderr,
          filteredError,
          filteredStdout
        } = cleanJunkMtpError({ error, stdout, stderr });

        if (
          (undefinedOrNull(filteredStderr) || filteredStderr.length < 1) &&
          (undefinedOrNull(filteredError) || filteredError.length < 1)
        ) {
          return resolve({
            data: filteredStdout,
            stderr: null,
            error: null
          });
        }

        return resolve({
          data: filteredStdout,
          stderr: filteredStderr.join('\n'),
          error: filteredError.join('\n')
        });
      });
    });
  } catch (e) {
    log.error(e);
  }
};

const promisifiedExecNoCatch = command => {
  return new Promise(resolve => {
    execPromise(command, (error, stdout, stderr) => {
      const {
        filteredStderr,
        filteredError,
        filteredStdout
      } = cleanJunkMtpError({ error, stdout, stderr });

      if (
        (undefinedOrNull(filteredStderr) || filteredStderr.length < 1) &&
        (undefinedOrNull(filteredError) || filteredError.length < 1)
      ) {
        return resolve({
          data: filteredStdout,
          stderr: null,
          error: null
        });
      }

      return resolve({
        data: stdout,
        stderr,
        error
      });
    });
  });
};

const checkMtpFileExists = async (filePath, mtpStoragesListSelected) => {
  const storageSelectCmd = `"storage ${mtpStoragesListSelected}"`;
  const escapedFilePath = `${escapeShellMtp(filePath)}`;

  const { stderr } = await promisifiedExecNoCatch(
    `${mtpCli} ${storageSelectCmd} "properties \\"${escapedFilePath}\\""`
  );

  return !stderr;
};

export const checkFileExists = async (
  filePath,
  deviceType,
  mtpStoragesListSelected
) => {
  try {
    if (typeof filePath === 'undefined' || filePath === null) {
      return null;
    }

    let _isArray = false;
    if (isArray(filePath)) {
      _isArray = true;
    }

    let fullPath = null;
    switch (deviceType) {
      case DEVICES_TYPE_CONST.local:
        if (_isArray) {
          for (let i = 0; i < filePath.length; i += 1) {
            const item = filePath[i];
            fullPath = path.resolve(item);
            if (await existsSync(fullPath)) {
              return true;
            }
          }
          return null;
        }

        fullPath = path.resolve(filePath);
        return await existsSync(fullPath);

      case DEVICES_TYPE_CONST.mtp:
        if (_isArray) {
          for (let i = 0; i < filePath.length; i += 1) {
            const item = filePath[i];
            fullPath = path.resolve(item);
            if (await checkMtpFileExists(fullPath, mtpStoragesListSelected)) {
              return true;
            }
          }
          return null;
        }

        fullPath = path.resolve(filePath);
        return await checkMtpFileExists(fullPath, mtpStoragesListSelected);

      default:
        break;
    }

    return true;
  } catch (e) {
    log.error(e);
  }
};

/**
  Local device ->
 */
export const asyncReadLocalDir = async ({ filePath, ignoreHidden }) => {
  try {
    const response = [];
    const { error, data } = await readdir(filePath, 'utf8')
      .then(res => {
        return {
          data: res,
          error: null
        };
      })
      .catch(e => {
        return {
          data: null,
          error: e
        };
      });

    if (error) {
      log.error(error, `asyncReadLocalDir`);
      return { error: true, data: null };
    }

    let files = data;

    files = data.filter(junk.not);
    if (ignoreHidden) {
      // eslint-disable-next-line no-useless-escape
      files = data.filter(item => !/(^|\/)\.[^\/\.]/g.test(item));
    }

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const fullPath = path.resolve(filePath, file);

      if (!existsSync(fullPath)) {
        continue; // eslint-disable-line no-continue
      }
      const stat = statSync(fullPath);
      const isFolder = lstatSync(fullPath).isDirectory();
      const extension = path.extname(fullPath);
      const { size, atime: dateTime } = stat;

      if (findLodash(response, { path: fullPath })) {
        continue; // eslint-disable-line no-continue
      }

      response.push({
        name: file,
        path: fullPath,
        extension,
        size,
        isFolder,
        dateAdded: moment(dateTime).format('YYYY-MM-DD HH:mm:ss')
      });
    }
    return { error, data: response };
  } catch (e) {
    log.error(e);
  }
};

export const promisifiedRimraf = item => {
  try {
    return new Promise(resolve => {
      rimraf(item, {}, error => {
        resolve({
          data: null,
          stderr: error,
          error
        });
      });
    });
  } catch (e) {
    log.error(e);
  }
};

export const delLocalFiles = async ({ fileList }) => {
  try {
    if (!fileList || fileList.length < 1) {
      return { error: `No files selected.`, stderr: null, data: null };
    }

    for (let i = 0; i < fileList.length; i += 1) {
      const item = fileList[i];
      const { error } = await promisifiedRimraf(item);
      if (error) {
        log.error(`${error}`, `delLocalFiles -> rm error`);
        return { error, stderr: null, data: false };
      }
    }

    return { error: null, stderr: null, data: true };
  } catch (e) {
    log.error(e);
  }
};

const promisifiedRename = ({ oldFilePath, newFilePath }) => {
  try {
    return new Promise(resolve => {
      fsRename(oldFilePath, newFilePath, error => {
        resolve({
          data: null,
          stderr: error,
          error
        });
      });
    });
  } catch (e) {
    log.error(e);
  }
};

export const renameLocalFiles = async ({ oldFilePath, newFilePath }) => {
  try {
    if (
      typeof oldFilePath === 'undefined' ||
      oldFilePath === null ||
      typeof newFilePath === 'undefined' ||
      newFilePath === null
    ) {
      return { error: `No files selected.`, stderr: null, data: null };
    }

    const { error } = await promisifiedRename({ oldFilePath, newFilePath });
    if (error) {
      log.error(`${error}`, `renameLocalFiles -> mv error`);
      return { error, stderr: null, data: false };
    }

    return { error: null, stderr: null, data: true };
  } catch (e) {
    log.error(e);
  }
};

const promisifiedMkdir = ({ newFolderPath }) => {
  try {
    return new Promise(resolve => {
      mkdirp(newFolderPath, error => {
        resolve({ data: null, stderr: error, error });
      });
    });
  } catch (e) {
    log.error(e);
  }
};

export const newLocalFolder = async ({ newFolderPath }) => {
  try {
    if (typeof newFolderPath === 'undefined' || newFolderPath === null) {
      return { error: `Invalid path.`, stderr: null, data: null };
    }

    const { error } = await promisifiedMkdir({ newFolderPath });
    if (error) {
      log.error(`${error}`, `newLocalFolder -> mkdir error`);
      return { error, stderr: null, data: false };
    }

    return { error: null, stderr: null, data: true };
  } catch (e) {
    log.error(e);
  }
};

/**
 MTP device ->
 */
export const fetchMtpStorageOptions = async () => {
  try {
    const { data, error, stderr } = await promisifiedExec(
      `${mtpCli} "storage-list"`
    );

    if (error || stderr) {
      log.error(
        `${error} : ${stderr}`,
        `fetchMtpStorageOptions -> storage-list error`,
        false
      );
      return { error, stderr, data: null };
    }

    const _storageList = splitIntoLines(data);

    const descMatchPattern = /description:(.*)/i;
    const storageIdMatchPattern = /([^\D]+)/;

    let storageList = {};
    _storageList
      .filter((a, index) => !filterOutMtpLines(a, index))
      .map((a, index) => {
        if (!a) {
          return null;
        }
        const _matchDesc = descMatchPattern.exec(a);
        const _matchedStorageId = storageIdMatchPattern.exec(a);

        if (
          typeof _matchDesc === 'undefined' ||
          _matchDesc === null ||
          typeof _matchDesc[1] === 'undefined' ||
          typeof _matchedStorageId === 'undefined' ||
          _matchedStorageId === null ||
          typeof _matchedStorageId[1] === 'undefined'
        ) {
          return null;
        }

        const matchDesc = _matchDesc[1].trim();
        const matchedStorageId = _matchedStorageId[1].trim();
        storageList = {
          ...storageList,
          [matchedStorageId]: {
            name: matchDesc,
            selected: index === 0
          }
        };

        return storageList;
      });

    if (
      typeof storageList === 'undefined' ||
      storageList === null ||
      storageList.length < 1
    ) {
      return {
        error: `${
          DEVICES_LABEL[DEVICES_TYPE_CONST.mtp]
        } storage not accessible`,
        stderr: null,
        data: null
      };
    }

    return { error: null, stderr: null, data: storageList };
  } catch (e) {
    log.error(e);
  }
};

export const asyncReadMtpDir = async ({
  filePath,
  ignoreHidden,
  mtpStoragesListSelected
}) => {
  try {
    const mtpCmdChopIndex = {
      type: 2,
      dateAdded: 4,
      timeAdded: 5
    };
    const response = [];
    const storageSelectCmd = `"storage ${mtpStoragesListSelected}"`;

    const {
      data: filePropsData,
      error: filePropsError,
      stderr: filePropsStderr
    } = await promisifiedExec(
      `${mtpCli} ${storageSelectCmd} "lsext \\"${escapeShellMtp(filePath)}\\""`
    );

    if (filePropsError || filePropsStderr) {
      log.error(
        `${filePropsError} : ${filePropsStderr}`,
        `asyncReadMtpDir -> lsext error`
      );
      return { error: filePropsError, stderr: filePropsStderr, data: null };
    }

    let fileProps = splitIntoLines(filePropsData);

    fileProps = fileProps.filter((a, index) => !filterOutMtpLines(a, index));

    for (let i = 0; i < fileProps.length; i += 1) {
      const item = fileProps[i];
      const matchedProps = item.match(
        /^(.*?)\s+\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/g
      );

      if (matchedProps === null || matchedProps.length < 1) {
        continue; // eslint-disable-line no-continue
      }

      const _matchedProps = matchedProps[0];
      const itemSplit = item.split(_matchedProps);

      if (itemSplit === null || itemSplit.length < 2 || itemSplit[1] === '') {
        continue; // eslint-disable-line no-continue
      }
      const matchedFileName = itemSplit[1].replace(/^\s{2}|\s$/g, '');
      const filePropsList = _matchedProps.replace(/\s\s+/g, ' ').split(' ');

      // eslint-disable-next-line no-useless-escape
      if (ignoreHidden && /(^|\/)\.[^\/\.]/g.test(matchedFileName)) {
        continue; // eslint-disable-line no-continue
      }

      const fullPath = path.resolve(filePath, matchedFileName);
      const isFolder = filePropsList[mtpCmdChopIndex.type] === '3001';
      const dateTime = `${filePropsList[mtpCmdChopIndex.dateAdded]} ${
        filePropsList[mtpCmdChopIndex.timeAdded]
      }`;
      const extension = getExtension(fullPath, isFolder);

      // avoid duplicate values
      if (findLodash(response, { path: fullPath })) {
        continue; // eslint-disable-line no-continue
      }
      response.push({
        name: matchedFileName,
        path: fullPath,
        extension,
        size: null,
        isFolder,
        dateAdded: moment(dateTime).format('YYYY-MM-DD HH:mm:ss')
      });
    }

    return { error: null, stderr: null, data: response };
  } catch (e) {
    log.error(e);
  }
};

export const renameMtpFiles = async ({
  oldFilePath,
  newFilePath,
  mtpStoragesListSelected
}) => {
  try {
    if (
      typeof oldFilePath === 'undefined' ||
      oldFilePath === null ||
      typeof newFilePath === 'undefined' ||
      newFilePath === null
    ) {
      return { error: `No files selected.`, stderr: null, data: null };
    }

    const storageSelectCmd = `"storage ${mtpStoragesListSelected}"`;
    const escapedOldFilePath = `${escapeShellMtp(oldFilePath)}`;
    const escapedNewFilePath = `${escapeShellMtp(baseName(newFilePath))}`;

    const { error, stderr } = await promisifiedExec(
      `${mtpCli} ${storageSelectCmd} "rename \\"${escapedOldFilePath}\\" \\"${escapedNewFilePath}\\""`
    );

    if (error || stderr) {
      log.error(`${error} : ${stderr}`, `renameMtpFiles -> rename error`);
      return { error, stderr, data: false };
    }

    return { error: null, stderr: null, data: true };
  } catch (e) {
    log.error(e);
  }
};

export const delMtpFiles = async ({ fileList, mtpStoragesListSelected }) => {
  try {
    if (!fileList || fileList.length < 1) {
      return { error: `No files selected.`, stderr: null, data: null };
    }

    const storageSelectCmd = `"storage ${mtpStoragesListSelected}"`;
    for (let i = 0; i < fileList.length; i += 1) {
      const { error, stderr } = await promisifiedExec(
        `${mtpCli} ${storageSelectCmd} "rm \\"${escapeShellMtp(
          fileList[i]
        )}\\""`
      );

      if (error || stderr) {
        log.error(`${error} : ${stderr}`, `delMtpDir -> rm error`);
        return { error, stderr, data: false };
      }
    }

    return { error: null, stderr: null, data: true };
  } catch (e) {
    log.error(e);
  }
};

export const newMtpFolder = async ({
  newFolderPath,
  mtpStoragesListSelected
}) => {
  try {
    if (typeof newFolderPath === 'undefined' || newFolderPath === null) {
      return { error: `Invalid path.`, stderr: null, data: null };
    }

    const storageSelectCmd = `"storage ${mtpStoragesListSelected}"`;
    const escapedNewFolderPath = `${escapeShellMtp(newFolderPath)}`;
    const { error, stderr } = await promisifiedExec(
      `${mtpCli} ${storageSelectCmd} "mkpath \\"${escapedNewFolderPath}\\""`
    );

    if (error || stderr) {
      log.error(`${error} : ${stderr}`, `newMtpFolder -> mkpath error`);
      return { error, stderr, data: false };
    }

    return { error: null, stderr: null, data: true };
  } catch (e) {
    log.error(e);
  }
};

export const pasteFiles = (
  { ...pasteArgs },
  { ...fetchDirListArgs },
  direction,
  deviceType,
  dispatch,
  getState,
  getCurrentWindow
) => {
  try {
    const {
      destinationFolder,
      mtpStoragesListSelected,
      fileTransferClipboard
    } = pasteArgs;

    if (
      typeof destinationFolder === 'undefined' ||
      destinationFolder === null
    ) {
      dispatch(
        processMtpOutput({
          deviceType,
          error: `Invalid path.`,
          stderr: null,
          data: null,
          callback: () => {
            dispatch(
              fetchDirList({ ...fetchDirListArgs }, deviceType, getState)
            );
          }
        })
      );
    }

    const storageSelectCmd = `"storage ${mtpStoragesListSelected}"`;
    const { queue } = fileTransferClipboard;

    if (typeof queue === 'undefined' || queue === null || queue.length < 1) {
      dispatch(
        processMtpOutput({
          deviceType,
          error: `No files selected`,
          stderr: null,
          data: null,
          callback: () => {
            dispatch(
              fetchDirList({ ...fetchDirListArgs }, deviceType, getState)
            );
          }
        })
      );
    }

    let _queue = [];
    let cmdArgs = {};
    switch (direction) {
      case 'mtpToLocal':
        _queue = (queue || []).map(sourcePath => {
          const destinationPath = path.resolve(destinationFolder);
          const escapedDestinationPath = escapeShellMtp(
            `${destinationPath}/${baseName(sourcePath)}`
          );
          const escapedSourcePath = `${escapeShellMtp(sourcePath)}`;

          return `-e ${storageSelectCmd} "get \\"${escapedSourcePath}\\" \\"${escapedDestinationPath}\\""`;
        });

        cmdArgs = {
          _queue
        };
        return _pasteFiles(
          { ...pasteArgs },
          { ...fetchDirListArgs },
          { ...cmdArgs },
          deviceType,
          dispatch,
          getState,
          getCurrentWindow
        );

      case 'localtoMtp':
        _queue = (queue || []).map(sourcePath => {
          const destinationPath = path.resolve(destinationFolder);
          const escapedDestinationPath = `${escapeShellMtp(destinationPath)}`;
          const escapedSourcePath = `${escapeShellMtp(sourcePath)}`;

          return `-e ${storageSelectCmd} "put \\"${escapedSourcePath}\\" \\"${escapedDestinationPath}\\""`;
        });

        cmdArgs = {
          _queue
        };

        return _pasteFiles(
          { ...pasteArgs },
          { ...fetchDirListArgs },
          { ...cmdArgs },
          deviceType,
          dispatch,
          getState,
          getCurrentWindow
        );

      default:
        break;
    }
  } catch (e) {
    log.error(e);
  }
};

const _pasteFiles = (
  { ...pasteArgs }, // eslint-disable-line no-unused-vars
  { ...fetchDirListArgs }, // eslint-disable-line no-unused-vars
  { ...cmdArgs },
  deviceType,
  dispatch,
  getState,
  getCurrentWindow
) => {
  try {
    const { _queue } = cmdArgs;
    const handletransferListTimeInterval = 1000;
    let transferList = {};
    let prevCopiedBlockSize = 0;
    let currentCopiedBlockSize = 0;
    let startTime = 0;
    let prevCopiedTime = 0;
    let currentCopiedTime = 0;
    let bufferedOutput = null;

    let handleTransferListInterval = setInterval(() => {
      if (transferList === null) {
        clearInterval(handleTransferListInterval);
        handleTransferListInterval = 0;
        return null;
      }

      if (Object.keys(transferList).length < 1) {
        return null;
      }

      const { percentage: _percentage, bodyText1, bodyText2 } = transferList;
      const copiedTimeDiff = currentCopiedTime - prevCopiedTime;
      const speed =
        prevCopiedBlockSize && prevCopiedBlockSize - currentCopiedBlockSize > 0
          ? (prevCopiedBlockSize - currentCopiedBlockSize) *
            (1000 / copiedTimeDiff)
          : 0;
      const _speed = speed ? `${niceBytes(speed)}` : `--`;
      const elapsedTime = msToTime(currentCopiedTime - startTime);
      prevCopiedTime = currentCopiedTime;
      prevCopiedBlockSize = currentCopiedBlockSize;

      getCurrentWindow().setProgressBar(_percentage / 100);
      dispatch(
        setFileTransferProgress({
          toggle: true,
          bodyText1,
          bodyText2: `Elapsed: ${elapsedTime} | Progress: ${bodyText2} @ ${_speed}/sec`,
          percentage: _percentage
        })
      );
    }, handletransferListTimeInterval);

    const cmd = spawn(mtpCli, [..._queue], {
      shell: true
    });

    cmd.stdout.on('data', data => {
      bufferedOutput = data.toString();

      if (startTime === 0) {
        startTime = unixTimestampNow();
      }

      if (
        typeof bufferedOutput === 'undefined' ||
        bufferedOutput === null ||
        bufferedOutput.length < 1
      ) {
        return null;
      }

      const _bufferedOutput = splitIntoLines(bufferedOutput).filter(
        (a, index) => !filterOutMtpLines(a, index)
      );

      if (_bufferedOutput.length < 1) {
        return null;
      }

      for (let i = 0; i < _bufferedOutput.length; i += 1) {
        const item = _bufferedOutput[i];
        const bufferedOutputSplit = item.split(' ');

        if (bufferedOutputSplit.length < 1) {
          return null;
        }

        const totalLength = bufferedOutputSplit.length;
        const eventIndex = 0;
        const filePathStartIndex = 1;
        const filePathEndIndex = totalLength - 3;
        const currentProgressSizeIndex = totalLength - 2;
        const totalFileSizeIndex = totalLength - 1;

        const event = bufferedOutputSplit[eventIndex];
        const matchedItem = item.match(/(\d+?\d*)\s(\d+?\d*)$/);
        if (matchedItem === null) {
          return null;
        }

        const matchedItemSplit = matchedItem[0].split(' ');
        const currentProgressSize = parseInt(matchedItemSplit[0], 10);
        const totalFileSize = parseInt(matchedItemSplit[1], 10);

        if (event === `:done`) {
          prevCopiedBlockSize = 0;
          currentCopiedBlockSize = 0;
          prevCopiedTime = 0;
          currentCopiedTime = 0;
          return null;
        }

        if (
          totalLength < 3 ||
          event !== `:progress` ||
          currentProgressSizeIndex < 2 ||
          totalFileSizeIndex < 3
        ) {
          return null;
        }

        const filePath = bufferedOutputSplit
          .slice(filePathStartIndex, filePathEndIndex + 1)
          .join(' ');

        const perc = percentage(currentProgressSize, totalFileSize);
        currentCopiedBlockSize = totalFileSize - currentProgressSize;
        currentCopiedTime = unixTimestampNow();

        transferList = {
          bodyText1: `${perc}% complete of ${truncate(baseName(filePath), 45)}`,
          bodyText2: `${niceBytes(currentProgressSize)} / ${niceBytes(
            totalFileSize
          )}`,
          percentage: perc,
          currentCopiedBlockSize,
          currentCopiedTime
        };
      }
    });

    cmd.stderr.on('data', error => {
      const { filteredError } = cleanJunkMtpError({ error });

      if (undefinedOrNull(filteredError) || filteredError.length < 1) {
        return null;
      }

      dispatch(
        processMtpOutput({
          deviceType,
          error,
          stderr: null,
          data: null,
          callback: () => {
            transferList = null;
            getCurrentWindow().setProgressBar(-1);
            dispatch(clearFileTransfer());
            dispatch(
              fetchDirList({ ...fetchDirListArgs }, deviceType, getState)
            );
          }
        })
      );
    });

    cmd.on('exit', () => {
      transferList = null;
      getCurrentWindow().setProgressBar(-1);
      dispatch(clearFileTransfer());
      dispatch(fetchDirList({ ...fetchDirListArgs }, deviceType, getState));
    });

    return { error: null, stderr: null, data: true };
  } catch (e) {
    log.error(e);
  }
};

export const mtpVerboseReport = async () => {
  try {
    const { data, error, stderr } = await promisifiedExec(`${mtpCli} "pwd" -v`);

    if (error) {
      log.doLog(`${error}`);
      return { error, stderr, data: null };
    }
    if (stderr) {
      log.doLog(`${stderr}`);
      return { error, stderr, data: null };
    }

    return { error: null, stderr: null, data };
  } catch (e) {
    log.error(e);
  }
};
