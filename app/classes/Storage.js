import { log } from '../utils/log';
import { readFileSync, writeFileSync } from '../helpers/fileOps';
import { checkIf } from '../utils/checkIf';
import { isEmpty } from '../utils/funcs';

export default class Storage {
  constructor(filePath) {
    this.filePath = filePath;
  }

  getAll() {
    try {
      const _stream = readFileSync(this.filePath);

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
    checkIf(keys, 'array');

    try {
      if (isEmpty(keys)) {
        return {};
      }

      const allItem = this.getAll();
      const _return = {};

      keys.map((a) => {
        if (typeof allItem[a] === 'undefined' || allItem[a] === null) {
          return null;
        }

        _return[a] = allItem[a];

        return a;
      });

      return _return;
    } catch (e) {
      log.error(e, `Storage -> getItems`);
    }
  }

  setAll({ ...data }) {
    try {
      writeFileSync(this.filePath, JSON.stringify({ ...data }));
    } catch (e) {
      log.error(e, `Storage -> setAll`);
    }
  }
}
