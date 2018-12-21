'use strict';

import { BrowserWindow } from 'electron';
import { PATHS } from './paths';
import { log } from './log';

/**
 * Report Bugs Window
 */
let _reportBugsWindow = null;

const reportBugsCreateWindow = () => {
  return new BrowserWindow({
    height: 480,
    width: 600,
    show: false,
    resizable: false,
    title: 'OpenMTP',
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
