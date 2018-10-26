'use strict';

import { PATHS } from '../utils/paths';
import { version, author, productName } from '../../package.json';

export const APP_NAME = productName;

export const APP_VERSION = version;

export const AUTHOR_EMAIL = author.email;

export const deviceTypeConst = { mtp: 'mtp', local: 'local' };

export const devicesDefaultPaths = {
  [deviceTypeConst.mtp]: '/',
  [deviceTypeConst.local]: PATHS.homeDir
};
