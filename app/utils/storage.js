'use strict';
import Promise from 'bluebird';
import { log } from '@Log';
import { readFileSync } from '../api/sys/fileOps';

export default class Storage {
  constructor(filePath) {
    this.filePath = filePath;
  }

  getAll(raw = false) {
    try {
      const _stream = readFileSync({ filePath: this.filePath });
      if (raw) {
        return _stream;
      }
      return JSON.parse(_stream);
    } catch (e) {
      log.error(e, `Storage -> getAll`);
    }
  }

  setAll() {
    try {
      //return readFileSync({ filePath: this.filePath });
    } catch (e) {
      log.error(e, `Storage -> setAll`);
    }
  }
}
