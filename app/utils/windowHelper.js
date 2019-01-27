'use strict';

import { BrowserWindow, remote } from 'electron';

export const getMainWindowMainProcess = () => {
  const _mainWindow = BrowserWindow.getAllWindows();
  if (typeof _mainWindow === 'undefined' || _mainWindow === null) {
    return null;
  }

  return BrowserWindow.getAllWindows()[_mainWindow.length - 1];
};

export const getMainWindowRendererProcess = () => {
  const _mainWindow = remote.BrowserWindow.getAllWindows();
  if (typeof _mainWindow === 'undefined' || _mainWindow === null) {
    return null;
  }

  return remote.BrowserWindow.getAllWindows()[_mainWindow.length - 1];
};
