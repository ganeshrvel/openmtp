'use strict';

/**
 * Constants
 * Note: Don't import log helper file from utils here
 */

import { PATHS } from '../utils/paths';

export const DEVICES_TYPE_CONST = { mtp: 'mtp', local: 'local' };

export const DEVICES_DEFAULT_PATH = {
  [DEVICES_TYPE_CONST.mtp]: '/',
  [DEVICES_TYPE_CONST.local]: PATHS.homeDir
};

export const DEVICES_LABEL = {
  [DEVICES_TYPE_CONST.mtp]: 'Phone',
  [DEVICES_TYPE_CONST.local]: `Computer`
};

export const FILE_EXPLORER_DEFAULT_FOCUSSED_DEVICE_TYPE =
  DEVICES_TYPE_CONST.local;

export const LOG_FILE_ROTATION_CLEANUP_THRESHOLD = 60; // in days

export const AUTO_UPDATE_CHECK_FIREUP_DELAY = 10000; // in ms

export const FILE_EXPLORER_TABLE_TRUNCATE_MAX_CHARS = 37;

export const FILE_EXPLORER_GRID_TRUNCATE_MAX_CHARS = 20;

export const DONATE_PAYPAL_URL = `https://paypal.me/ganeshrvel`;
