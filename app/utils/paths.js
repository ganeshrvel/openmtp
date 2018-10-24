'use strict';

import path from 'path';
import os from 'os';
import { IS_DEV } from '../constants/env';
import { yearMonthNow } from './date';

const root = process.cwd();
const homeDir = os.homedir();
const profileFolder = path.join(homeDir, `./.io.ganeshrvel`, `openmtp`);
const rotateFile = yearMonthNow({});
const logFileName = IS_DEV
  ? `error-${rotateFile}.dev.log`
  : `error-${rotateFile}.log`;
const logFolder = path.join(profileFolder, `./logs`);
const logFile = path.join(logFolder, `./${logFileName}`);
const settingsFile = path.join(profileFolder, `./settings.json`);

export const PATHS = {
  root: path.resolve(root),
  app: path.resolve(path.join(root, `./app`)),
  dist: path.resolve(path.join(root, `./app/dist`)),
  nodeModules: path.resolve(path.join(root, `./node_modules`)),
  homeDir: path.resolve(homeDir),
  profileFolder: path.resolve(profileFolder),
  logFolder: path.resolve(logFolder),
  logFile: path.resolve(logFile),
  settingsFile: path.resolve(settingsFile)
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
  return filePath.split(/[/]/).pop();
};
