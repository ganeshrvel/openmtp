'use strict';

import { log } from '@Log';
import {
  checkFileExists,
  newLocalFolder,
  promisifiedRimraf
} from '../api/sys/index';
import { baseName, PATHS } from '../utils/paths';
import { fileExistsSync, writeFileAsync } from '../api/sys/fileOps';
import fs from 'fs';
import { daysDiff, yearMonthNow } from '../utils/date';
import { LOG_FILE_ROTATION_CLEANUP_THRESHOLD, DEVICES_TYPE_CONST } from '../constants';

const { logFile, settingsFile, logDir } = PATHS;
const deviceType = DEVICES_TYPE_CONST.local;
const logFileRotationCleanUpThreshold = LOG_FILE_ROTATION_CLEANUP_THRESHOLD;

export default class Boot {
  constructor() {
    this.verifyDirList = [logDir];
    this.verifyFileList = [settingsFile, logFile];
  }

  async init() {
    try {
      for (let i in this.verifyDirList) {
        const item = this.verifyDirList[i];

        if (!(await this.verifyDir(item))) {
          await this.createDir(item);
        }
      }

      for (let i in this.verifyFileList) {
        const item = this.verifyFileList[i];

        if (!this.verifyFile(item)) {
          await this.createFile(item);
        }
      }

      return true;
    } catch (e) {
      log.error(e, `Boot -> init`);
    }
  }

  async verify() {
    try {
      for (let i in this.verifyDirList) {
        const item = this.verifyDirList[i];

        if (!(await this.verifyDir(item))) {
          return false;
        }
      }

      for (let i in this.verifyFileList) {
        const item = this.verifyFileList[i];

        if (!this.verifyFile(item)) {
          return false;
        }
      }

      return true;
    } catch (e) {
      log.error(e, `Boot -> verify`);
    }
  }

  quickVerify() {
    try {
      for (let i in this.verifyFileList) {
        const item = this.verifyFileList[i];

        if (!this.verifyFile(item)) {
          return false;
        }
      }
    } catch (e) {
      log.error(e, `Boot -> verify`);
    }
  }

  async verifyDir(filePath) {
    try {
      return await checkFileExists(filePath, deviceType, null);
    } catch (e) {
      log.error(e, `Boot -> verifyDir`);
    }
  }

  async createDir(filePath) {
    try {
      const { error, stderr, data } = await newLocalFolder({
        newFolderPath: filePath
      });

      return !(error || stderr);
    } catch (e) {
      log.error(e, `Boot -> createDir`);
    }
  }

  verifyFile(filePath) {
    try {
      return fileExistsSync(filePath);
    } catch (e) {
      log.error(e, `Boot -> verifyFile`);
    }
  }

  createFile(filePath) {
    try {
      writeFileAsync({
        filePath: filePath,
        text: ``
      });
    } catch (e) {
      log.error(e, `Boot -> createFile`);
    }
  }

  cleanRotationFiles() {
    try {
      const dirFileList = fs.readdirSync(logDir);
      const pattern = `^\\${baseName(logFile)}`;
      const _regex = new RegExp(pattern, 'gi');
      const filesList = dirFileList.filter(elm => {
        return !elm.match(_regex);
      });

      if (filesList === null || filesList.length < 1) {
        return null;
      }

      filesList.map(async a => {
        const dateMatch = a.match(/\d{4}-\d{2}/g);
        if (
          dateMatch === null ||
          dateMatch.length < 1 ||
          typeof dateMatch[0] === 'undefined' ||
          dateMatch[0] === null
        ) {
          return null;
        }

        const _diff = daysDiff(yearMonthNow({}), dateMatch[0]);
        if (_diff >= logFileRotationCleanUpThreshold) {
          await promisifiedRimraf(`${logDir}/${a}`);
        }
      });
    } catch (e) {
      log.error(e, `Boot -> cleanRotationFiles`);
    }
  }
}
