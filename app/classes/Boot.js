'use strict';

/* eslint no-await-in-loop: off */

/**
 * Boot
 * Note: Don't import log helper file from utils here
 */

import { readdirSync } from 'fs';
import { baseName, PATHS } from '../utils/paths';
import {
  fileExistsSync,
  writeFileAsync,
  createDirSync,
  deleteFilesSync
} from '../api/sys/fileOps';
import { daysDiff, yearMonthNow } from '../utils/date';
import { LOG_FILE_ROTATION_CLEANUP_THRESHOLD } from '../constants';

const { logFile, settingsFile, logDir } = PATHS;
const logFileRotationCleanUpThreshold = LOG_FILE_ROTATION_CLEANUP_THRESHOLD;

export default class Boot {
  constructor() {
    this.verifyDirList = [logDir];
    this.verifyFileList = [logFile];
    this.settingsFile = settingsFile;
  }

  async init() {
    try {
      for (let i = 0; i < this.verifyDirList.length; i += 1) {
        const item = this.verifyDirList[i];

        if (!(await this.verifyDir(item))) {
          await this.createDir(item);
        }
      }

      if (!this.verifyFile(this.settingsFile)) {
        await this.createFile(this.settingsFile);
      }

      for (let i = 0; i < this.verifyFileList.length; i += 1) {
        const item = this.verifyFileList[i];

        if (!this.verifyFile(item)) {
          await this.createFile(item);
        }
      }

      return true;
    } catch (e) {
      console.error(e);
    }
  }

  async verify() {
    try {
      for (let i = 0; i < this.verifyFileList.length; i += 1) {
        const item = this.verifyDirList[i];

        if (!(await this.verifyDir(item))) {
          return false;
        }
      }
      for (let i = 0; i < this.verifyFileList.length; i += 1) {
        const item = this.verifyFileList[i];

        if (!this.verifyFile(item)) {
          return false;
        }
      }

      return true;
    } catch (e) {
      console.error(e);
    }
  }

  quickVerify() {
    try {
      for (let i = 0; i < this.verifyFileList.length; i += 1) {
        const item = this.verifyFileList[i];

        if (!this.verifyFile(item)) {
          return false;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async verifyDir(filePath) {
    try {
      return fileExistsSync(filePath);
    } catch (e) {
      console.error(e);
    }
  }

  async createDir(newFolderPath) {
    try {
      createDirSync(newFolderPath);
    } catch (e) {
      console.error(e);
    }
  }

  verifyFile(filePath) {
    try {
      return fileExistsSync(filePath);
    } catch (e) {
      console.error(e);
    }
  }

  createFile(filePath) {
    try {
      writeFileAsync(filePath, ``);
    } catch (e) {
      console.error(e);
    }
  }

  cleanRotationFiles() {
    try {
      const dirFileList = readdirSync(logDir);
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
          deleteFilesSync(`${logDir}/${a}`);
        }
      });
    } catch (e) {
      console.error(e);
    }
  }
}
