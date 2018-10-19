'use strict';

import { close, existsSync, open, write } from 'fs';
import { EOL } from 'os';

export const writeFileAsync = ({ filePath, text, append = true }) => {
  let flag = 'a';
  if (!append) {
    flag = 'w';
  }
  open(filePath, flag, 666, (e, id) => {
    write(id, text + EOL, null, 'utf8', () => {
      close(id, () => {});
    });
  });
};

export const fileExistsSync = filePath => {
  return existsSync(filePath);
};
