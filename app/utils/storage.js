'use strict';
import { log } from '@Log';
import { readFileSync, writeFileAsync } from '../api/sys/fileOps';

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

  setAll({ ...data }) {
    try {
      writeFileAsync({
        filePath: this.filePath,
        text: JSON.stringify({ ...data })
      });
    } catch (e) {
      log.error(e, `Storage -> setAll`);
    }
  }
}
