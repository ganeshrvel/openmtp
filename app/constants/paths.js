/**
 * Paths
 * Note: Don't import log helper file from utils here
 */

import { join, resolve } from 'path';
import { homedir as homedirOs } from 'os';
import url from 'url';
import { rootPath as root } from 'electron-root-path';
import { isPackaged } from '../utils/isPackaged';
import { IS_DEV } from './env';
import { yearMonthNow } from '../utils/date';
import { APP_NAME } from './meta';
import { getAppDataPath } from '../utils/files';

const appPath = join(root, `./app`);
const configDir = join(root, `./config`);
const homeDir = homedirOs();
const profileDir = getAppDataPath();

// old generation [profileDir] path. Used until OpenMTP < v3.0.0
const prevProfileDir = join(homeDir, `./.io.ganeshrvel`);

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
  prevProfileDir: resolve(prevProfileDir),
  desktopDir: join(homeDir, `/Desktop`),
  documentsDir: join(homeDir, `/Documents`),
  downloadsDir: join(homeDir, `/Downloads`),
  picturesDir: join(homeDir, `/Pictures`),
  volumesDir: '/Volumes',
  systemRootDir: '/',
  loadUrlPath: url.format({
    protocol: 'file',
    slashes: true,
    pathname: !isPackaged
      ? join(appPath, './app.html')
      : join(__dirname, './app.html'),
  }),
};
