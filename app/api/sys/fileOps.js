'use strict';

import { existsSync, writeFile, appendFile } from 'fs';
import { EOL } from 'os';

export const writeFileAsync = ({ filePath, text }) => {
  const options = { mode: 0o755 };
  writeFile(filePath, text + EOL, options, err => {
    if (err) {
      return console.error(err, `writeFileAsync`);
    }
  });
};

export const appendFileAsync = ({ filePath, text }) => {
  const options = { mode: 0o755 };
  appendFile(filePath, text + EOL, options, err => {
    if (err) {
      return console.error(err, `appendFileAsync`);
    }
  });
};

export const fileExistsSync = filePath => {
  return existsSync(filePath);
};
