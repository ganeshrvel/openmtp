'use strict';

import {
  existsSync as _existsSync,
  writeFile as _writeFileAsync,
  appendFile as _appendFileAsync,
  readFileSync as _readFileSync,
  writeFileSync as _writeFileSync
} from 'fs';
import { EOL } from 'os';

export const writeFileAsync = ({ filePath, text }) => {
  const options = { mode: 0o755 };
  _writeFileAsync(filePath, text, options, err => {
    if (err) {
      console.error(err, `writeFileAsync`);
      return null;
    }
  });
};

export const writeFileSync = ({ filePath, text }) => {
  const options = { mode: 0o755 };
  _writeFileSync(filePath, text, options, err => {
    if (err) {
      console.error(err, `writeFileSync`);
      return null;
    }
  });
};

export const appendFileAsync = ({ filePath, text }) => {
  const options = { mode: 0o755 };
  _appendFileAsync(filePath, text + EOL, options, err => {
    if (err) {
      console.error(err, `appendFileAsync`);
      return null;
    }
  });
};

export const readFileSync = ({ filePath }) => {
  const options = { encoding: 'utf8' };
  return _readFileSync(filePath, options);
};

export const fileExistsSync = filePath => {
  return _existsSync(filePath);
};
