'use strict';

import { PATHS } from '../utils/paths';
import { version, author, productName } from '../../package.json';

export const APP_NAME = productName;

export const APP_VERSION = version;

export const AUTHOR_EMAIL = author.email;

export const DEVICES_TYPE_CONST = { mtp: 'mtp', local: 'local' };

export const DEVICES_DEFAULT_PATH = {
  [DEVICES_TYPE_CONST.mtp]: '/',
  [DEVICES_TYPE_CONST.local]: PATHS.homeDir
};

export const ENABLE_BACKGROUND_AUTO_UPDATE = false;
