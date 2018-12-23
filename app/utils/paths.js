'use strict';

/**
 * Paths
 * Note: Don't import log helper file from utils here
 */

import path from 'path';
import { isPackaged } from '../utils/isPackaged';
import os from 'os';
import { IS_DEV, IS_PROD } from '../constants/env';
import { yearMonthNow } from './date';
import { APP_IDENTIFIER, APP_NAME } from '../constants/meta';

const root = process.cwd();
const appPath = path.join(root, `./app`);
const configDir = path.join(root, `./config`);
const homeDir = os.homedir();
const profileDir = path.join(homeDir, `./.io.ganeshrvel`, `${APP_IDENTIFIER}`);
const rotateFile = yearMonthNow({});
const logFileName = IS_DEV
  ? `error-${rotateFile}.dev.log`
  : `error-${rotateFile}.log`;
const logDir = path.join(profileDir, `./logs`);
const logFile = path.join(logDir, `./${APP_NAME}-${logFileName}`);
const settingsFile = path.join(profileDir, `./settings.json`);
const appUpdateFile = path.join(configDir, `./dev-app-update.yml`);

export const PATHS = {
  root: path.resolve(root),
  app: path.resolve(appPath),
  dist: path.resolve(path.join(root, `./app/dist`)),
  nodeModules: path.resolve(path.join(root, `./node_modules`)),
  homeDir: path.resolve(homeDir),
  profileDir: path.resolve(profileDir),
  configDir: path.resolve(configDir),
  logDir: path.resolve(logDir),
  logFile: path.resolve(logFile),
  settingsFile: path.resolve(settingsFile),
  appUpdateFile: path.resolve(appUpdateFile),
  loadUrlPath: !isPackaged
    ? `file://${appPath}/app.html`
    : `file://${__dirname}/app.html`
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
