'use strict';

/**
 * Paths
 * Note: Don't import log helper file from utils here
 */

import { join, parse, resolve } from 'path';
import { homedir as homedirOs } from 'os';
import url from 'url';
import { rootPath as root } from 'electron-root-path';
import { isPackaged } from './isPackaged';
import { IS_DEV } from '../constants/env';
import { yearMonthNow } from './date';
import { APP_IDENTIFIER, APP_NAME } from '../constants/meta';

const appPath = join(root, `./app`);
const configDir = join(root, `./config`);
const homeDir = homedirOs();
const profileDir = join(homeDir, `./.io.ganeshrvel`, `${APP_IDENTIFIER}`);
const rotateFile = yearMonthNow({});
const logFileName = IS_DEV
  ? `error-${rotateFile}.dev.log`
  : `error-${rotateFile}.log`;
const logDir = join(profileDir, `./logs`);
const logFile = join(logDir, `./${APP_NAME}-${logFileName}`);
const settingsFile = join(profileDir, `./settings.json`);
const appUpdateFile = join(configDir, `./dev-app-update.yml`);

export const PATHS = {
  root: resolve(root),
  app: resolve(appPath),
  dist: resolve(join(appPath, `./dist`)),
  nodeModules: resolve(join(root, `./node_modules`)),
  homeDir: resolve(homeDir),
  profileDir: resolve(profileDir),
  configDir: resolve(configDir),
  logDir: resolve(logDir),
  logFile: resolve(logFile),
  settingsFile: resolve(settingsFile),
  appUpdateFile: resolve(appUpdateFile),
  loadUrlPath: url.format({
    protocol: 'file',
    slashes: true,
    pathname: !isPackaged
      ? join(appPath, './app.html')
      : join(__dirname, './app.html')
  })
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
  const parsedPath = pathInfo(filePath);

  return parsedPath !== null ? parsedPath.base : null;
};

export const getExtension = (fileName, isFolder) => {
  if (isFolder) {
    return null;
  }
  const parsedPath = pathInfo(fileName);

  return parsedPath !== null ? parsedPath.ext : null;
};

export const pathInfo = filePath => {
  return parse(filePath);
};
