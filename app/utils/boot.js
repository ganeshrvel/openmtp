'use strict';

import { createWriteStream } from 'fs';
import { checkFileExists, newLocalFolder } from '../api/sys';
import { fileExistsSync, PATHS } from './paths';
import { deviceTypeConst } from '../constants';

const { profileFolder, settingFile, logFile } = PATHS;
const deviceType = deviceTypeConst.local;

export default class boot {
  constructor() {}

  async init() {
    if (!(await this.verifyProfileDir())) {
      return await this.createProfileDir();
    }

    if (!this.verifyProfileFiles(settingFile)) {
      this.createProfileFiles(settingFile);
    }

    if (!this.verifyProfileFiles(logFile)) {
      this.createProfileFiles(logFile);
    }

    return (
      this.verifyProfileFiles(settingFile) && this.verifyProfileFiles(logFile)
    );
  }

  async verifyProfileDir() {
    return await checkFileExists(profileFolder, deviceType, null);
  }

  async createProfileDir() {
    const { error, stderr, data } = await newLocalFolder({
      newFolderPath: profileFolder
    });

    return !(error || stderr);
  }

  verifyProfileFiles(filePath) {
    return fileExistsSync(filePath);
  }

  createProfileFiles(filePath) {
    const createStream = createWriteStream(filePath);
    createStream.end();
  }
}
