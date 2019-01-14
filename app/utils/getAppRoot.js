'use strict';

import { join, resolve } from 'path';
import electronIs from 'electron-is';
import { IS_PROD } from '../constants/env';
import { isPackaged } from './isPackaged';

let root = null;

if (isPackaged) {
  // renderer and main process - packaged build
  if (electronIs.windows()) {
    // windows platform
    root = join(__dirname, '../../../../');
  } else {
    // non windows platform
    root = join(__dirname, '../../../../../');
  }
} else if (IS_PROD) {
  // renderer and main process - prod build
  if (electronIs.renderer()) {
    // renderer process - prod build
    root = join(__dirname, '..');
  } else if (process.env.RUN_TYPE === 'dry') {
    // main process - prod build (dry run)
    root = join(__dirname, '..');
  } else {
    // main process - prod build (compiling)
    root = join(__dirname, '..', '..');
  }
} else if (electronIs.renderer()) {
  // renderer process - dev build
  root = join(__dirname, '..');
} else {
  // main process - dev build
  root = join(__dirname, '..', '..');
}

export const appRoot = resolve(root);
