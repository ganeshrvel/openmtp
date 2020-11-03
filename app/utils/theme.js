import { remote, nativeTheme } from 'electron';
import { APP_THEME_MODE_TYPE } from '../enums';
import { settingsStorage } from './storageHelper';

export const getAppThemeMode = (appThemeMode) => {
  // compatible with both renderer and main process
  const { shouldUseDarkColors } = remote?.nativeTheme ?? nativeTheme ?? {};

  switch (appThemeMode) {
    case APP_THEME_MODE_TYPE.dark:
      return appThemeMode;

    case APP_THEME_MODE_TYPE.light:
      return appThemeMode;

    default:
      if (shouldUseDarkColors) {
        return APP_THEME_MODE_TYPE.dark;
      }

      return APP_THEME_MODE_TYPE.light;
  }
};

export const getContrastingTheme = (appThemeMode) => {
  if (appThemeMode === APP_THEME_MODE_TYPE.dark) {
    return APP_THEME_MODE_TYPE.light;
  }

  return APP_THEME_MODE_TYPE.dark;
};

export const getAppThemeModeSettings = () => {
  const setting = settingsStorage.getItems(['appThemeMode']);

  return getAppThemeMode(setting.appThemeMode);
};
