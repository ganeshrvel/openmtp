'use strict';
import { log } from '../utils/Log';
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

  getItems(keys) {
    try {
      if (typeof keys === 'undefined' || keys === null || keys.length < 0) {
        return {};
      }

      const allItem = this.getAll();
      let _return = {};

      keys.map(a => {
        if (typeof allItem[a] === 'undefined' || allItem[a] === null) {
          return null;
        }
        
        _return[a] = allItem[a];
      });

      return _return;
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
