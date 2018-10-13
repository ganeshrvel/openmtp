'use strict';

import fs from 'fs';
import Promise from 'bluebird';
import junk from 'junk';
import path from 'path';
import moment from 'moment';
import { log } from '@Log';
import { mtp } from '@Binaries';
import childProcess from 'child_process';
import spawn from 'spawn-promise';

const readdir = Promise.promisify(fs.readdir);
const exec = Promise.promisify(childProcess.exec);

export const promisifiedSpawn = cmd => {
  return spawn(...cmd)
    .then(res => {
      return {
        data: res.toString(),
        error: null
      };
    })
    .catch(e => {
      return {
        data: null,
        error: e.toString()
      };
    });
};

const promisifiedExec = command => {
  try {
    return new Promise(function(resolve, reject) {
      exec(command, (error, stdout, stderr) =>
        resolve({
          data: stdout,
          stderr: stderr,
          error: error
        })
      );
    });
  } catch (e) {
    log.error(e);
  }
};

export const checkFileExists = filePath => {
  let fullPath = path.resolve(filePath);

  return fs.existsSync(fullPath);
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

    let {
      data: fileListData,
      error: fileListError,
      stderr: fileListStderr
    } = await promisifiedExec(`rm -rf ${escapedCmd}`);

    if (fileListError || fileListStderr) {
      log.error(
        `${fileListError} : ${fileListStderr}`,
        `delLocalFiles -> rm error`
      );
      return { error: fileListError, stderr: fileListStderr, data: false };
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

    let {
      data: fileListData,
      error: fileListError,
      stderr: fileListStderr
    } = await promisifiedExec(`mv ${escapedOldFilePath} ${escapedNewFilePath}`);

    if (fileListError || fileListStderr) {
      log.error(
        `${fileListError} : ${fileListStderr}`,
        `renameLocalFiles -> mv error`
      );
      return { error: fileListError, stderr: fileListStderr, data: false };
    }

    return { error: null, stderr: null, data: true };
  } catch (e) {
    log.error(e);
  }
};

export const newFolderLocalFiles = async ({ newFolderPath }) => {
  try {
    if (typeof newFolderPath === 'undefined' || newFolderPath === null) {
      return { error: `No files selected.`, stderr: null, data: null };
    }

    const escapednewFolderPath = `"${escapeShell(newFolderPath)}"`;

    let {
      data: fileListData,
      error: fileListError,
      stderr: fileListStderr
    } = await promisifiedExec(`mkdir -p ${escapednewFolderPath}`);

    if (fileListError || fileListStderr) {
      log.error(
        `${fileListError} : ${fileListStderr}`,
        `newFolderLocalFiles -> mkdir error`
      );
      return { error: fileListError, stderr: fileListStderr, data: false };
    }

    return { error: null, stderr: null, data: true };
  } catch (e) {
    log.error(e);
  }
};

/**
 MTP device ->
 */
export const asyncReadMtpDir = async ({ filePath, ignoreHidden }) => {
  try {
    const mtpCmdChop = {
      type: 2,
      dateAdded: 4,
      timeAdded: 5,
      name: 6
    };
    let response = [];

    const {
      data: fileListData,
      error: fileListError,
      stderr: fileListStderr
    } = await promisifiedExec(`${mtp} "ls \\"${escapeShell(filePath)}\\""`);

    const {
      data: filePropsData,
      error: filePropsError,
      stderr: filePropsStderr
    } = await promisifiedExec(
      `${mtp} "lsext \\"${escapeShell(filePath)}\\"" | tr -s " "`
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
        return !(a === '\n' || a === '\r\n' || a === '');
      })
      .map(a => {
        return a.replace(/(^|\.\s+)\d+\s+/, '');
      });

    fileProps = fileProps.filter(a => {
      return !(a === '\n' || a === '\r\n' || a === '');
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

export const delMtpFiles = async ({ fileList }) => {
  try {
    if (!fileList || fileList.length < 1) {
      return { error: `No files selected.`, stderr: null, data: null };
    }

    for (let i in fileList) {
      let {
        data: fileListData,
        error: fileListError,
        stderr: fileListStderr
      } = await promisifiedExec(
        `${mtp} "rm \\"${escapeShell(fileList[i])}\\""`
      );

      if (fileListError || fileListStderr) {
        log.error(
          `${fileListError} : ${fileListStderr}`,
          `delMtpDir -> rm error`
        );
        return { error: fileListError, stderr: fileListStderr, data: false };
      }
    }

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

const escapeShell = cmd => {
  return cmd.replace(/"/g, '\\"');
};
