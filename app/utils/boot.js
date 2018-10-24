'use strict';

import { createWriteStream } from 'fs';
import { log } from '@Log';
import { checkFileExists, newLocalFolder } from '../api/sys';
import { PATHS } from './paths';
import { fileExistsSync } from '../api/sys/fileOps';
import { deviceTypeConst } from '../constants';

const { logFile, settingsFile, logFolder } = PATHS;
const deviceType = deviceTypeConst.local;

export default class boot {
  constructor() {
    this.verifyDirList = [logFolder];
    this.verifyFileList = [settingsFile, logFile];
  }

  async init() {
    try {
      for (let i in this.verifyDirList) {
        const item = this.verifyDirList[i];

        if (!(await this.verifyDir(item))) {
          await this.createDir(item);
        }

        if (!(await this.verifyDir(item))) {
          return false;
        }
      }

      for (let i in this.verifyFileList) {
        const item = this.verifyFileList[i];

        if (!this.verifyFile(item)) {
          await this.createFile(item);
        }

        if (!this.verifyFile(item)) {
          return false;
        }
      }

      return true;
    } catch (e) {
      log.error(e, `boot -> init`);
    }
  }

  async verifyDir(filePath) {
    try {
      return await checkFileExists(filePath, deviceType, null);
    } catch (e) {
      log.error(e, `boot -> verifyDir`);
    }
  }

  async createDir(filePath) {
    try {
      const { error, stderr, data } = await newLocalFolder({
        newFolderPath: filePath
      });

      return !(error || stderr);
    } catch (e) {
      log.error(e, `boot -> createDir`);
    }
  }

  verifyFile(filePath) {
    try {
      return fileExistsSync(filePath);
    } catch (e) {
      log.error(e, `boot -> verifyFile`);
    }
  }

  createFile(filePath) {
    try {
      const createStream = createWriteStream(filePath);
      createStream.end();
    } catch (e) {
      log.error(e, `boot -> createFile`);
    }
  }
}
