'use strict';

import { BrowserWindow, remote } from 'electron';
import { settingsStorage } from './storageHelper';
import { materialUiSkeletonThemeStyles } from '../containers/App/styles';
import { getAppThemeMode } from './theme';

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

export const getWindowBackgroundColor = () => {
  const setting = settingsStorage.getItems(['appThemeMode']);
  const appThemeMode = getAppThemeMode(setting.appThemeMode);

  const { background } = materialUiSkeletonThemeStyles({ appThemeMode });

  return background;
};
