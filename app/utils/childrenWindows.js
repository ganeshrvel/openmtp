'use strict';

import { BrowserWindow } from 'electron';
import { PATHS } from './paths';
import { log } from './log';

/**
 * Report Bugs Window
 */
let reportBugsWindow = null;

const reportBugsCreateWindow = () => {
  return new BrowserWindow({
    height: 480,
    width: 600,
    show: false,
    resizable: false,
    title: '',
    minimizable: false,
    fullscreenable: false
  });
};

export const reportBugs = () => {
  if (reportBugsWindow) {
    reportBugsWindow.focus();
    reportBugsWindow.show();
    return null;
  }

  reportBugsWindow = reportBugsCreateWindow();
  reportBugsWindow.loadURL(`${PATHS.loadUrlPath}#reportBugsPage`);

  reportBugsWindow.webContents.on('did-finish-load', () => {
    reportBugsWindow.show();
    reportBugsWindow.focus();
  });

  reportBugsWindow.onerror = (error, url, line) => {
    log.error(error, `menu -> reportBugsWindow -> onerror`);
  };

  reportBugsWindow.on('closed', function() {
    reportBugsWindow = null;
  });
};
