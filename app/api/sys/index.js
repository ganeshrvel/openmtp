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
  return exec(command)
    .then(stdout => {
      return {
        data: stdout,
        error: null
      };
    })
    .catch(e => {
      return {
        data: null,
        error: e
      };
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

export const asyncReadMtpDir = async ({ filePath, ignoreHidden }) => {
  const mtpCmdChop = {
    type: 2,
    dateAdded: 4,
    timeAdded: 5,
    name: 6
  };
  let response = [];

  let { data, error } = await promisifiedExec(
    `${mtp} "lsext ${filePath}" | tr -s " "`
  );
  if (error) {
    log.error(error, `asyncReadLocalDir`);
    return { error: error.message, data: null };
  }

  const lines = data.split(/(\r?\n)/g);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === '\n' || lines[i] === '\r\n' || data[i] === '') {
      continue;
    }

    let linesList = lines[i].split(' ');
    if (typeof linesList[mtpCmdChop.name] === 'undefined') {
      continue;
    }
    const fileName = linesList[mtpCmdChop.name];
    let fullPath = path.resolve(filePath, fileName);
    let isFolder = linesList[mtpCmdChop.type] === '3001';
    let dateTime = `${linesList[mtpCmdChop.dateAdded]} ${
      linesList[mtpCmdChop.timeAdded]
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

  return { error, data: response };
};
