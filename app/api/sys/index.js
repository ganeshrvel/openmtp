'use strict';

import fs from 'fs';
import Promise from 'bluebird';
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

export const asyncReadLocalDir = async ({ filePath, ignoreHidden }) => {
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
};

const promisifiedExec = command => {
  return new Promise(function(resolve, reject) {
    exec(command, (error, stdout, stderr) =>
      resolve({
        data: stdout,
        stderr: stderr,
        error: error
      })
    );
  });
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

export const asyncReadMtpDir = async ({ filePath, ignoreHidden }) => {
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

  const fileList = fileListData.split(/(\r?\n)/g).map(a => {
    return a.replace(/(^|\.\s+)\d+\s+/, '');
  });
  const fileProps = filePropsData.split(/(\r?\n)/g);

  for (let i = 0; i < fileProps.length; i++) {
    if (
      fileProps[i] === '\n' ||
      fileProps[i] === '\r\n' ||
      filePropsData[i] === ''
    ) {
      continue;
    }

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
};
