'use strict';

import { join, resolve } from 'path';
import electronIs from 'electron-is';
// import { IS_PROD } from '../constants/env';

let root = join(__dirname, '..', '..');

if (electronIs.renderer()) {
  root = join(__dirname, '..');
}

export const rootPath = resolve(root);

console.log(`rootPath`, rootPath);
