import { BrowserWindow } from 'electron';
import { urls } from 'nice-utils';
import { getAppThemeMode } from './theme';
import { getCurrentThemePalette } from '../containers/App/styles';
import { undefinedOrNull } from '../utils/funcs';
import { IS_RENDERER } from '../constants/env';
import { getRemoteWindow } from './remoteWindowHelpers';

const remote = getRemoteWindow();

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
  const appThemeMode = getAppThemeMode();
  const { background } = getCurrentThemePalette(appThemeMode);

  return background.paper;
};

export const getCurrentWindowHash = () => {
  if (!IS_RENDERER) {
    return null;
  }

  const hash = urls().getHash();

  if (undefinedOrNull(hash) || hash === '') {
    return '/';
  }

  return hash;
};
