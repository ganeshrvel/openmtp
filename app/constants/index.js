/**
 * Constants
 * Note: Don't import log helper file from utils here
 */

import { PATHS } from './paths';
import { DEVICE_TYPE } from '../enums';

export const OS_ARCH_TYPE = {
  amd64: 'amd64',
  arm64: 'arm64',
};

// To support macOS version below Big Sur the Kalam kernel needs to be compiled on an older macOS machine everytime there is an update, which is practically very difficult.
// So any version included in the [KALAM_HISTORIC_VERSION_TYPE] will not receive the latest Kalam Kernel updates
export const KALAM_HISTORIC_VERSION_TYPE = {
  medieval: 'medieval', // macOS 10.14 (Mojave) and 10.15 (Catalina). libusb support is still available but since it requires Mojave or lower to compile the kernel, it is being deprecated.
};

// if the user's os version is higher than the ones listed here then latest kalam kernel binaies will be used
// reference: https://github.com/npm/node-semver#ranges
export const KALAM_HISTORIC_MACOS_VERSION_RANGE = {
  [KALAM_HISTORIC_VERSION_TYPE.medieval]: `>=10.14 <=10.15.999`,
};

export const NODE_MAC_PERMISSIONS_MIN_OS = `11.0.0`;

export const KALAM_MODE_MIN_MACOS_VERSION = `>=10.14`;

export const DEVICES_DEFAULT_PATH = {
  [DEVICE_TYPE.mtp]: '/',
  [DEVICE_TYPE.local]: PATHS.homeDir,
};

export const DEVICES_LABEL = {
  [DEVICE_TYPE.mtp]: `Phone`,
  [DEVICE_TYPE.local]: `Computer`,
};

export const FILE_EXPLORER_DEFAULT_FOCUSSED_DEVICE_TYPE = DEVICE_TYPE.local;

export const LOG_FILE_ROTATION_CLEANUP_THRESHOLD = 60; // in days

export const AUTO_UPDATE_CHECK_FIREUP_DELAY = 10000; // in ms

export const FILE_EXPLORER_TABLE_TRUNCATE_MAX_CHARS = 37;

export const FILE_EXPLORER_GRID_TRUNCATE_MAX_CHARS = 20;

export const DONATE_PAYPAL_URL = `https://paypal.me/ganeshrvel`;

export const BUY_ME_A_COFFEE_URL = `https://www.buymeacoffee.com/ganeshrvel`;

export const DELETE_KEIS_SMARTSWITCH_URL = `https://farazfazli.medium.com/how-i-reverse-engineered-keis-and-sidesync-and-fixed-mtp-8949acbb1c29`;

export const USB_HOTPLUG_MAX_ATTEMPTS = 6;

export const USB_HOTPLUG_MAX_ATTEMPTS_TIMEOUT = 15000; // in ms
