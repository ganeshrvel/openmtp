'use strict';

import { BrowserWindow, remote } from 'electron';
import { PATHS } from './paths';
import { log } from './log';
import { loadProfileErrorHtml } from '../templates/loadProfileError';
import { APP_TITLE } from '../constants/meta';
import { undefinedOrNull } from './funcs';
import { PRIVACY_POLICY_PAGE_TITLE } from '../templates/privacyPolicyPage';

let _nonBootableDeviceWindow = null;
let _reportBugsWindow = null;
let _privacyPolicyWindow = null;

/**
 * Non Bootable Device Window
 */

export const getMainWindow = () => {
  const _mainWindow = BrowserWindow.getAllWindows();
  if (typeof _mainWindow === 'undefined' || _mainWindow === null) {
    return null;
  }

  return BrowserWindow.getAllWindows()[_mainWindow.length - 1];
};

const nonBootableDeviceCreateWindow = () => {
  return new BrowserWindow({
    title: `${APP_TITLE}`,
    center: true,
    show: false,
    maximizable: false,
    minimizable: false,
    width: 480,
    height: 320,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
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
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true
    }
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

    _reportBugsWindow.onerror = error => {
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
 * Privacy Policy Window
 */

const privacyPolicyCreateWindow = isRenderedPage => {
  const config = {
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    show: false,
    resizable: true,
    title: `${APP_TITLE}`,
    minimizable: true,
    fullscreenable: true,
    webPreferences: {
      nodeIntegration: true
    }
  };

  // incoming call from a rendered page
  if (isRenderedPage) {
    const allWindows = remote.BrowserWindow.getAllWindows();

    return loadExistingWindow(allWindows, PRIVACY_POLICY_PAGE_TITLE)
      ? null
      : new remote.BrowserWindow(config);
  }

  // incoming call from the main process
  const allWindows = BrowserWindow.getAllWindows();

  return loadExistingWindow(allWindows, PRIVACY_POLICY_PAGE_TITLE)
    ? null
    : new BrowserWindow(config);
};

export const privacyPolicyWindow = (isRenderedPage = false) => {
  try {
    if (_privacyPolicyWindow) {
      _privacyPolicyWindow.focus();
      _privacyPolicyWindow.show();
      return _privacyPolicyWindow;
    }

    // show the existing _privacyPolicyWindow
    const _privacyPolicyWindowTemp = privacyPolicyCreateWindow(isRenderedPage);
    if (!_privacyPolicyWindowTemp) {
      return _privacyPolicyWindow;
    }

    _privacyPolicyWindow = _privacyPolicyWindowTemp;
    _privacyPolicyWindow.loadURL(`${PATHS.loadUrlPath}#privacyPolicyPage`);
    _privacyPolicyWindow.webContents.on('did-finish-load', () => {
      _privacyPolicyWindow.show();
      _privacyPolicyWindow.focus();
    });

    _privacyPolicyWindow.onerror = error => {
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

const loadExistingWindow = (allWindows, title) => {
  if (!undefinedOrNull(allWindows)) {
    for (let i = 0; i < allWindows.length; i += 1) {
      const item = allWindows[i];
      if (item.getTitle().indexOf(title) !== -1) {
        item.focus();
        item.show();

        return item;
      }
    }
  }

  return null;
};
