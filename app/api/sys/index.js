'use strict';

import fs, { rename as fsRename } from 'fs';
import Promise from 'bluebird';
import junk from 'junk';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';
import path from 'path';
import moment from 'moment';
import { log } from '@Log';
import { mtp as _mtpCli } from '@Binaries';
import { spawn, exec } from 'child_process';
import findLodash from 'lodash/find';
import { deviceTypeConst } from '../../constants';
import { baseName, PATHS } from '../../utils/paths';
import {
  clearFileTransfer,
  fetchDirList,
  processMtpOutput,
  setFileTransferProgress
} from '../../containers/HomePage/actions';
import { isArray } from 'util';
import {
  niceBytes,
  percentage,
  splitIntoLines,
  truncate
} from '../../utils/funcs';
import { msToTime, unixTimestampNow } from '../../utils/date';

const readdir = Promise.promisify(fs.readdir);
const execPromise = Promise.promisify(exec);

/**
 * If you are reading this then let me tell you something "bunch of idiots are working at Apple inc."
 *
 * This is made to support flex quotes parser for mtp cli.
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
  } else if (cmd.indexOf(`\\"`) !== -1) {
    return cmd
      .replace(/`/g, '\\`')
      .replace(/\\/g, `\\\\\\`)
      .replace(/"/g, `\\\\\\\\"`);
  } else if (cmd.indexOf(`"\\`) !== -1) {
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

const promisifiedExec = command => {
  try {
    return new Promise((resolve, reject) => {
      execPromise(command, (error, stdout, stderr) => {
        return resolve({
          data: stdout,
          stderr: stderr,
          error: error
        });
      });
    });
  } catch (e) {
    log.error(e);
  }
};

const promisifiedExecNoCatch = command => {
  return new Promise((resolve, reject) => {
    execPromise(command, (error, stdout, stderr) =>
      resolve({
        data: stdout,
        stderr: stderr,
        error: error
      })
    );
  });
};

const checkMtpFileExists = async (filePath, mtpStoragesListSelected) => {
  const storageSelectCmd = `"storage ${mtpStoragesListSelected}"`;
  const escapedFilePath = `${escapeShellMtp(filePath)}`;

  const { data, error, stderr } = await promisifiedExecNoCatch(
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
      case deviceTypeConst.local:
        if (_isArray) {
          for (let i in filePath) {
            let item = filePath[i];
            fullPath = path.resolve(item);
            return await fs.existsSync(fullPath);
          }
          return null;
        }

        fullPath = path.resolve(filePath);
        return await fs.existsSync(fullPath);
        break;
      case deviceTypeConst.mtp:
        if (_isArray) {
          for (let i in filePath) {
            let item = filePath[i];
            fullPath = path.resolve(item);
            return await checkMtpFileExists(fullPath, mtpStoragesListSelected);
          }
          return null;
        }

        fullPath = path.resolve(filePath);
        return await checkMtpFileExists(fullPath, mtpStoragesListSelected);
        break;
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
    let response = [];
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
      files = data.filter(item => !/(^|\/)\.[^\/\.]/g.test(item));
    }

    for (let file of files) {
      let fullPath = path.resolve(filePath, file);

      if (!fs.existsSync(fullPath)) {
        continue;
      }
      const stat = fs.statSync(fullPath);
      const isFolder = fs.lstatSync(fullPath).isDirectory();
      const extension = path.extname(fullPath);
      const size = stat.size;
      const dateTime = stat.atime;

      if (findLodash(response, { path: fullPath })) {
        continue;
      }

      response.push({
        name: file,
        path: fullPath,
        extension: extension,
        size: size,
        isFolder: isFolder,
        dateAdded: moment(dateTime).format('YYYY-MM-DD HH:mm:ss')
      });
    }
    return { error, data: response };
  } catch (e) {
    log.error(e);
  }
};

const promisifiedRimraf = item => {
  try {
    return new Promise(function(resolve, reject) {
      rimraf(item, {}, error => {
        resolve({
          data: null,
          stderr: error,
          error: error
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

    for (let i in fileList) {
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
    return new Promise(function(resolve, reject) {
      fsRename(oldFilePath, newFilePath, error => {
        resolve({
          data: null,
          stderr: error,
          error: error
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

const promisifiedMkdirp = ({ newFolderPath }) => {
  try {
    return new Promise(function(resolve, reject) {
      mkdirp(newFolderPath, error => {
        resolve({ data: null, stderr: error, error: error });
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

    const { error } = await promisifiedMkdirp({ newFolderPath });
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

    let descMatchPattern = /description:(.*)/i;
    let storageIdMatchPattern = /([^\D]+)/;

    let storageList = {};
    _storageList.filter(a => !filterOutMtpLines(a)).map((a, index) => {
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
    });

    if (
      typeof storageList === 'undefined' ||
      storageList === null ||
      storageList.length < 1
    ) {
      return { error: `MTP storage not accessible`, stderr: null, data: null };
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
    let response = [];
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

    fileProps = fileProps.filter(a => !filterOutMtpLines(a));

    for (let i = 0; i < fileProps.length; i++) {
      const item = fileProps[i];
      const matchedProps = item.match(
        /^(.*?)\s+\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/g
      );

      if (matchedProps === null || matchedProps.length < 1) {
        continue;
      }

      const _matchedProps = matchedProps[0];
      const itemSplit = item.split(_matchedProps);

      if (itemSplit === null || itemSplit.length < 2 || itemSplit[1] === '') {
        continue;
      }
      const matchedFileName = itemSplit[1].replace(/^\s{2}|\s$/g, '');
      const filePropsList = _matchedProps.replace(/\s\s+/g, ' ').split(' ');

      if (ignoreHidden && /(^|\/)\.[^\/\.]/g.test(matchedFileName)) {
        continue;
      }

      let fullPath = path.resolve(filePath, matchedFileName);
      let isFolder = filePropsList[mtpCmdChopIndex.type] === '3001';
      let dateTime = `${filePropsList[mtpCmdChopIndex.dateAdded]} ${
        filePropsList[mtpCmdChopIndex.timeAdded]
      }`;

      //avoid duplicate values
      if (findLodash(response, { path: fullPath })) {
        continue;
      }
      response.push({
        name: matchedFileName,
        path: fullPath,
        extension: fetchExtension(filePath, isFolder),
        size: null,
        isFolder: isFolder,
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

    const { data, error, stderr } = await promisifiedExec(
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
    for (let i in fileList) {
      const { data, error, stderr } = await promisifiedExec(
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
    const { data, error, stderr } = await promisifiedExec(
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
  getState
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
          callback: a => {
            dispatch(
              fetchDirList({ ...fetchDirListArgs }, deviceType, getState)
            );
          }
        })
      );
    }

    const storageSelectCmd = `"storage ${mtpStoragesListSelected}"`;
    let { queue } = fileTransferClipboard;

    if (typeof queue === 'undefined' || queue === null || queue.length < 1) {
      dispatch(
        processMtpOutput({
          deviceType,
          error: `No files selected`,
          stderr: null,
          data: null,
          callback: a => {
            dispatch(
              fetchDirList({ ...fetchDirListArgs }, deviceType, getState)
            );
          }
        })
      );
    }

    let _queue = [],
      cmdArgs = {};
    switch (direction) {
      case 'mtpToLocal':
        _queue = queue.map(sourcePath => {
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
          getState
        );
        break;

      case 'localtoMtp':
        _queue = queue.map(sourcePath => {
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
          getState
        );
        break;
      default:
        break;
    }
  } catch (e) {
    log.error(e);
  }
};

const _pasteFiles = (
  { ...pasteArgs },
  { ...fetchDirListArgs },
  { ...cmdArgs },
  deviceType,
  dispatch,
  getState
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

    let handletransferListInterval = setInterval(() => {
      if (transferList === null) {
        clearInterval(handletransferListInterval);
        handletransferListInterval = 0;
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
        a => !filterOutMtpLines(a)
      );

      if (_bufferedOutput.length < 1) {
        return null;
      }

      for (let i in _bufferedOutput) {
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

        let currentProgressSize = parseInt(matchedItemSplit[0]);
        let totalFileSize = parseInt(matchedItemSplit[1]);

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

    cmd.stderr.on('data', e => {
      dispatch(
        processMtpOutput({
          deviceType,
          error: e,
          stderr: null,
          data: null,
          callback: a => {
            transferList = null;
            dispatch(clearFileTransfer());
            dispatch(
              fetchDirList({ ...fetchDirListArgs }, deviceType, getState)
            );
          }
        })
      );
    });

    cmd.on('exit', code => {
      transferList = null;
      dispatch(clearFileTransfer());
      dispatch(fetchDirList({ ...fetchDirListArgs }, deviceType, getState));
    });

    return { error: null, stderr: null, data: true };
  } catch (e) {
    log.error(e);
  }
};

const filterOutMtpLines = string => {
  return (
    string === '\n' ||
    string === '\r\n' ||
    string === '' ||
    string.toLowerCase().indexOf(`selected storage`) !== -1 ||
    string.toLowerCase().indexOf(`device::find failed`) !== -1
  );
};

const fetchExtension = (fileName, isFolder) => {
  if (isFolder) {
    return null;
  }
  return fileName.indexOf('.') === -1
    ? null
    : fileName.substring(fileName.lastIndexOf('.') + 1);
};
