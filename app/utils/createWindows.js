'use strict';

import { BrowserWindow } from 'electron';
import { PATHS } from './paths';
import { log } from './log';
import { loadProfileErrorHtml } from '../templates/loadProfileError';
import { APP_TITLE } from '../constants/meta';

let _nonBootableDeviceWindow = null;
let _reportBugsWindow = null;
let _privacyPolicyWindow = null;

/**
 * Non Bootable Device Window
 */

const nonBootableDeviceCreateWindow = () => {
  return new BrowserWindow({
    title: `${APP_TITLE}`,
    center: true,
    show: false,
    maximizable: false,
    minimizable: false,
    width: 480,
    height: 320,
    resizable: false
  });
};

export const nonBootableDeviceWindow = () => {
  _nonBootableDeviceWindow = nonBootableDeviceCreateWindow();
  _nonBootableDeviceWindow.loadURL(
    `data:text/html;charset=utf-8, ${encodeURI(loadProfileErrorHtml)}`
  );

  _nonBootableDeviceWindow.webContents.on('did-finish-load', () => {
    if (!_nonBootableDeviceWindow) {
      throw new Error(`"nonBootableDeviceWindow" is not defined`);
    }
    if (process.env.START_MINIMIZED) {
      _nonBootableDeviceWindow.minimize();
    } else {
      _nonBootableDeviceWindow.show();
      _nonBootableDeviceWindow.focus();
    }
  });

  _nonBootableDeviceWindow.on('closed', () => {
    _nonBootableDeviceWindow = null;
  });

  return _nonBootableDeviceWindow;
};

/**
 * Report Bugs Window
 */

const reportBugsCreateWindow = () => {
  return new BrowserWindow({
    height: 480,
    width: 600,
    show: false,
    resizable: false,
    title: `${APP_TITLE}`,
    minimizable: false,
    fullscreenable: false
  });
};

export const reportBugsWindow = () => {
  try {
    if (_reportBugsWindow) {
      _reportBugsWindow.focus();
      _reportBugsWindow.show();
      return _reportBugsWindow;
    }

    _reportBugsWindow = reportBugsCreateWindow();

    _reportBugsWindow.loadURL(`${PATHS.loadUrlPath}#reportBugsPage`);
    _reportBugsWindow.webContents.on('did-finish-load', () => {
      _reportBugsWindow.show();
      _reportBugsWindow.focus();
    });

    _reportBugsWindow.onerror = (error, url, line) => {
      log.error(error, `createWindows -> reportBugsWindow -> onerror`);
    };

    _reportBugsWindow.on('closed', () => {
      _reportBugsWindow = null;
    });

    return _reportBugsWindow;
  } catch (e) {
    log.error(e, `createWindows -> reportBugsWindow`);
  }
};

/**
 * Privacy POlicy Window
 */

const privacyPolicyCreateWindow = () => {
  return new BrowserWindow({
    height: 600,
    width: 640,
    show: false,
    resizable: false,
    title: `${APP_TITLE}`,
    minimizable: true,
    fullscreenable: true
  });
};

export const privacyPolicyWindow = () => {
  try {
    if (_privacyPolicyWindow) {
      _privacyPolicyWindow.focus();
      _privacyPolicyWindow.show();
      return _privacyPolicyWindow;
    }

    _privacyPolicyWindow = privacyPolicyCreateWindow();

    _privacyPolicyWindow.loadURL(`${PATHS.loadUrlPath}#privacyPolicyPage`);
    _privacyPolicyWindow.webContents.on('did-finish-load', () => {
      _privacyPolicyWindow.show();
      _privacyPolicyWindow.focus();
    });

    _privacyPolicyWindow.onerror = (error, url, line) => {
      log.error(error, `createWindows -> privacyPolicyWindow -> onerror`);
    };

    _privacyPolicyWindow.on('closed', () => {
      _privacyPolicyWindow = null;
    });

    return _privacyPolicyWindow;
  } catch (e) {
    log.error(e, `createWindows -> privacyPolicyWindow`);
  }
};
