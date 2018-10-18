'use strict';

import path from 'path';
import os from 'os';

const root = process.cwd();
export const PATHS = {
  root: root,
  app: path.resolve(root, './app'),
  dist: path.resolve(root, './app/dist'),
  nodeModules: path.resolve(root, './node_modules'),
  homeDir: os.homedir()
};

export const pathUp = filePath => {
  return filePath.replace(/\/$/, '').replace(/\/[^/]+$/, '') || '/';
};

export const sanitizePath = filePath => {
  return filePath.replace(/\/\/+/g, '/');
};

export const baseName = filePath => {
  if (typeof filePath === 'undefined' || filePath === null) {
    return null;
  }
  filePath = path.resolve(filePath);
  return filePath.split(/[\\/]/).pop();
};
