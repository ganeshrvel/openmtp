'use strict';

/**
 * Constants
 * Note: Don't import log helper file from utils here
 */

import { PATHS } from '../utils/paths';
import { repository, homepage } from '../../package.json';

export const DEVICES_TYPE_CONST = { mtp: 'mtp', local: 'local' };

export const DEVICES_DEFAULT_PATH = {
  [DEVICES_TYPE_CONST.mtp]: '/',
  [DEVICES_TYPE_CONST.local]: PATHS.homeDir
};

export const DEVICES_LABEL = {
  [DEVICES_TYPE_CONST.mtp]: 'MTP Device',
  [DEVICES_TYPE_CONST.local]: `Computer`
};

export const LOG_FILE_ROTATION_CLEANUP_THRESHOLD = 60; //in days

export const ENABLE_BACKGROUND_AUTO_UPDATE = false;

export const AUTO_UPDATE_CHECK_FIREUP_DELAY = 10000; //in ms

export const FILE_EXPLORER_TABLE_TRUNCATE_MAX_CHARS = 37;

export const FILE_EXPLORER_GRID_TRUNCATE_MAX_CHARS = 20;

export const APP_GITHUB_URL = repository.url.replace(/.git$/, '');

export const APP_GITHUB_RELEASES_URL = `${APP_GITHUB_URL}/releases`;

export const APP_WEBSITE = `${homepage}`;

export const DONATE_PAYPAL_URL = `https://paypal.me/ganeshrvel`;
