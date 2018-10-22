'use strict';
import Promise from 'bluebird';
import { log } from '@Log';
import { PATHS } from './paths';
const { settingsFolder } = PATHS;
//const settingFileJson = readFileSync({ filePath: PATHS.settingFile });

class Storage {
  constructor(filePath) {
    this.filePath = filePath;
  }

  init() {
    //return promisifiedStorage;
  }
}

export const settingsStorage = new Storage(settingsFolder).init();
