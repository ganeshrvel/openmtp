'use strict';

import fs from 'fs';
import Promise from 'bluebird';
import junk from 'junk';
import path from 'path';
import moment from 'moment';
import { log } from '@Log';
import { mtp as mtpCli } from '@Binaries';
import { spawn, exec } from 'child_process';
import findLodash from 'lodash/find';
import { deviceTypeConst } from '../../constants';
import { baseName } from '../../utils/paths';
import {
  clearFileTransfer,
  fetchDirList,
  processMtpOutput,
  setFileTransferProgress
} from '../../containers/HomePage/actions';

const readdir = Promise.promisify(fs.readdir);
const execPromise = Promise.promisify(exec);

const promisifiedExec = command => {
  try {
    return new Promise(function(resolve, reject) {
      execPromise(command, (error, stdout, stderr) => {
        //todo: remove this after testing is done

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
  return new Promise(function(resolve, reject) {
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
  //todo: remove this after testing is done
  if (typeof mtpStoragesListSelected === 'undefined') {
    log.error(mtpStoragesListSelected, 'mtpStoragesListSelected is undefined');
    return null;
  }
  const storageSelectCmd = `"storage ${mtpStoragesListSelected}"`;
  const escapedFilePath = `${escapeShell(filePath)}`;

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
    let fullPath = path.resolve(filePath);
    switch (deviceType) {
      case deviceTypeConst.local:
        return await fs.existsSync(fullPath);
        break;
      case deviceTypeConst.mtp:
        //todo: remove this after testing is done
        if (typeof mtpStoragesListSelected === 'undefined') {
          log.error(
            mtpStoragesListSelected,
            'mtpStoragesListSelected is undefined'
          );
          return null;
        }

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

export const delLocalFiles = async ({ fileList }) => {
  try {
    if (!fileList || fileList.length < 1) {
      return { error: `No files selected.`, stderr: null, data: null };
    }

    const escapedCmd = fileList
      .map(a => {
        return `"${escapeShell(a)}"`;
      })
      .join(' ');

    const { data, error, stderr } = await promisifiedExec(
      `rm -rf ${escapedCmd}`
    );

    if (error || stderr) {
      log.error(`${error} : ${stderr}`, `delLocalFiles -> rm error`);
      return { error, stderr, data: false };
    }

    return { error: null, stderr: null, data: true };
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

    const escapedOldFilePath = `"${escapeShell(oldFilePath)}"`;
    const escapedNewFilePath = `"${escapeShell(newFilePath)}"`;

    const { data, error, stderr } = await promisifiedExec(
      `mv ${escapedOldFilePath} ${escapedNewFilePath}`
    );

    if (error || stderr) {
      log.error(`${error} : ${stderr}`, `renameLocalFiles -> mv error`);
      return { error, stderr, data: false };
    }

    return { error: null, stderr: null, data: true };
  } catch (e) {
    log.error(e);
  }
};

export const newLocalFolder = async ({ newFolderPath }) => {
  try {
    if (typeof newFolderPath === 'undefined' || newFolderPath === null) {
      return { error: `Invalid path.`, stderr: null, data: null };
    }

    const escapedNewFolderPath = `"${escapeShell(newFolderPath)}"`;

    const { data, error, stderr } = await promisifiedExec(
      `mkdir -p ${escapedNewFolderPath}`
    );

    if (error || stderr) {
      log.error(`${error} : ${stderr}`, `newLocalFolder -> mkdir error`);
      return { error, stderr, data: false };
    }

    return { error: null, stderr: null, data: true };
  } catch (e) {
    log.error(e);
  }
};

/**
 MTP device ->
 */
const filterOutMtpLines = string => {
  return (
    string.indexOf(`selected storage`) !== -1 ||
    string.indexOf(`Device::Find failed`) !== -1
  );
};

export const fetchMtpStorageOptions = async () => {
  try {
    const { data, error, stderr } = await promisifiedExec(
      `${mtpCli} "storage-list"`
    );

    if (error || stderr) {
      log.error(
        `${error} : ${stderr}`,
        `fetchMtpStorageOptions -> storage-list error`
      );
      return { error, stderr, data: null };
    }

    const _storageList = data.split(/(\r?\n)/g);

    let descMatchPattern = /description:(.*)/i;
    let storageIdMatchPattern = /([^\D]+)/;

    let storageList = {};
    _storageList
      .filter(a => {
        return !(
          a === '\n' ||
          a === '\r\n' ||
          a === '' ||
          filterOutMtpLines(a)
        );
      })
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
    const mtpCmdChop = {
      type: 2,
      dateAdded: 4,
      timeAdded: 5,
      name: 6
    };
    let response = [];
    const storageSelectCmd = `"storage ${mtpStoragesListSelected}"`;

    //todo: remove this after testing is done
    if (typeof mtpStoragesListSelected === 'undefined') {
      log.error(
        mtpStoragesListSelected,
        'mtpStoragesListSelected is undefined'
      );
      return null;
    }

    const {
      data: fileListData,
      error: fileListError,
      stderr: fileListStderr
    } = await promisifiedExec(
      `${mtpCli} ${storageSelectCmd} "ls \\"${escapeShell(filePath)}\\""`
    );

    const {
      data: filePropsData,
      error: filePropsError,
      stderr: filePropsStderr
    } = await promisifiedExec(
      `${mtpCli} ${storageSelectCmd} "lsext \\"${escapeShell(
        filePath
      )}\\"" | tr -s " "`
    );

    if (fileListError || fileListStderr) {
      log.error(
        `${fileListError} : ${fileListStderr}`,
        `asyncReadMtpDir -> ls error`
      );
      return { error: fileListError, stderr: fileListStderr, data: null };
    }

    if (filePropsError || filePropsStderr) {
      log.error(
        `${filePropsError} : ${filePropsStderr}`,
        `asyncReadMtpDir -> lsext error`
      );
      return { error: filePropsError, stderr: filePropsStderr, data: null };
    }

    let fileList = fileListData.split(/(\r?\n)/g);
    let fileProps = filePropsData.split(/(\r?\n)/g);

    fileList = fileList
      .filter(a => {
        return !(
          a === '\n' ||
          a === '\r\n' ||
          a === '' ||
          filterOutMtpLines(a)
        );
      })
      .map(a => {
        return a.replace(/(^|\.\s+)\d+\s+/, '');
      });

    fileProps = fileProps.filter(a => {
      return !(a === '\n' || a === '\r\n' || a === '' || filterOutMtpLines(a));
    });

    if (fileList.length > fileProps.length) {
      fileList.shift();
    }

    for (let i = 0; i < fileProps.length; i++) {
      let filePropsList = fileProps[i].split(' ');
      if (typeof filePropsList[mtpCmdChop.name] === 'undefined') {
        continue;
      }
      const fileName = fileList[i];

      if (ignoreHidden && /(^|\/)\.[^\/\.]/g.test(fileName)) {
        continue;
      }

      let fullPath = path.resolve(filePath, fileName);
      let isFolder = filePropsList[mtpCmdChop.type] === '3001';
      let dateTime = `${filePropsList[mtpCmdChop.dateAdded]} ${
        filePropsList[mtpCmdChop.timeAdded]
      }`;

      //avoid duplicate values
      if (findLodash(response, { path: fullPath })) {
        continue;
      }
      response.push({
        name: fileName,
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

export const delMtpFiles = async ({ fileList, mtpStoragesListSelected }) => {
  try {
    if (!fileList || fileList.length < 1) {
      return { error: `No files selected.`, stderr: null, data: null };
    }

    //todo: remove this after testing is done
    if (typeof mtpStoragesListSelected === 'undefined') {
      log.error(
        mtpStoragesListSelected,
        'mtpStoragesListSelected is undefined'
      );
      return null;
    }

    const storageSelectCmd = `"storage ${mtpStoragesListSelected}"`;
    for (let i in fileList) {
      const { data, error, stderr } = await promisifiedExec(
        `${mtpCli} ${storageSelectCmd} "rm \\"${escapeShell(fileList[i])}\\""`
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

    //todo: remove this after testing is done
    if (typeof mtpStoragesListSelected === 'undefined') {
      log.error(
        mtpStoragesListSelected,
        'mtpStoragesListSelected is undefined'
      );
      return null;
    }

    const storageSelectCmd = `"storage ${mtpStoragesListSelected}"`;
    const escapedNewFolderPath = `${escapeShell(newFolderPath)}`;
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

export const pasteMtpFiles = (
  { ...pasteArgs },
  { ...fetchDirListArgs },
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

      return null;
    }

    //todo: remove this after testing is done
    if (typeof mtpStoragesListSelected === 'undefined') {
      log.error(
        mtpStoragesListSelected,
        'mtpStoragesListSelected is undefined'
      );
      return null;
    }
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

    const storageSelectCmd = `"storage ${mtpStoragesListSelected}"`;

    const _queue = queue.map(sourcePath => {
      const destinationPath = path.resolve(destinationFolder);
      const escapedDestinationPath = `${escapeShell(destinationPath)}`;
      const escapedSourcePath = `${escapeShell(sourcePath)}`;

      return `${storageSelectCmd} "put \\"${escapedSourcePath}\\" \\"${escapedDestinationPath}\\""`;
    });

    const cmd = spawn(mtpCli, [..._queue], {
      shell: true
    });

    cmd.stdout.on('data', data => {
      dispatch(
        setFileTransferProgress({
          toggle: true,
          currentFile: null,
          percentage: 0
        })
      );
    });

    cmd.stderr.on('data', e => {
      dispatch(
        processMtpOutput({
          deviceType,
          error: e,
          stderr: null,
          data: null,
          callback: a => {
            dispatch(clearFileTransfer());
            dispatch(
              fetchDirList({ ...fetchDirListArgs }, deviceType, getState)
            );
          }
        })
      );
    });

    cmd.on('exit', code => {
      dispatch(clearFileTransfer());
      dispatch(fetchDirList({ ...fetchDirListArgs }, deviceType, getState));
    });

    return { error: null, stderr: null, data: true };
  } catch (e) {
    log.error(e);
  }
};

const fetchExtension = (fileName, isFolder) => {
  if (isFolder) {
    return null;
  }
  return fileName.indexOf('.') === -1
    ? null
    : fileName.substring(fileName.lastIndexOf('.') + 1);
};

export const escapeShell = cmd => {
  return cmd.replace(/"/g, '\\"');
};
