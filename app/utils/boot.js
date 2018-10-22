'use strict';

import { createWriteStream } from 'fs';
import { log } from '@Log';
import { checkFileExists, newLocalFolder } from '../api/sys';
import { PATHS } from './paths';
import { fileExistsSync } from '../api/sys/fileOps';
import { deviceTypeConst } from '../constants';

const { logFile, settingsFolder } = PATHS;
const deviceType = deviceTypeConst.local;

export default class boot {
  constructor() {}

  async init() {
    try {
      if (!(await this.verifyDir(settingsFolder))) {
        return await this.createDir(settingsFolder);
      }

      if (!this.verifyProfileFiles(logFile)) {
        this.createProfileFiles(logFile);
      }

      return this.verifyProfileFiles(logFile);
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

  verifyProfileFiles(filePath) {
    try {
      return fileExistsSync(filePath);
    } catch (e) {
      log.error(e, `boot -> verifyProfileFiles`);
    }
  }

  createProfileFiles(filePath) {
    try {
      const createStream = createWriteStream(filePath);
      createStream.end();
    } catch (e) {
      log.error(e, `boot -> createProfileFiles`);
    }
  }
}
