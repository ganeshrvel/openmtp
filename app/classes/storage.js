'use strict';
import { log } from '@Log';
import { readFileSync, writeFileSync } from '../api/sys/fileOps';

export default class Storage {
  constructor(filePath) {
    this.filePath = filePath;
  }

  getAll() {
    try {
      const _stream = readFileSync({ filePath: this.filePath });
      if (
        typeof _stream === 'undefined' ||
        _stream === null ||
        Object.keys(_stream).length < 1
      ) {
        return {};
      }
      return JSON.parse(_stream);
    } catch (e) {
      log.error(e, `Storage -> getAll`);
    }
  }

  setAll({ ...data }) {
    try {
      writeFileSync({
        filePath: this.filePath,
        text: JSON.stringify({ ...data })
      });
    } catch (e) {
      log.error(e, `Storage -> setAll`);
    }
  }
}
