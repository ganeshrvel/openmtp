'use strict';

const fs = require('fs');
import Promise from 'bluebird';
import path from 'path';
import { log } from '@Log';
const readdir = Promise.promisify(fs.readdir);
import spawn from 'spawn-promise';

export const asyncCmd = cmd => {
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

export const asyncReadDir = async ({ filePath, ignoreHidden }) => {
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
    log.error(error, `asyncReadDir`);
    return { error: error.message, data: null };
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
    const isFolder = fs.lstatSync(fullPath).isDirectory();
    const extension = path.extname(fullPath);
    const size = fs.statSync(fullPath).size;
    response.push({
      name: file,
      path: fullPath,
      extension: extension,
      size: size,
      isFolder: isFolder
    });
  }
  return { error, data: response };
};
