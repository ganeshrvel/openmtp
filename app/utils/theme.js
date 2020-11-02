import { remote } from 'electron';
import { APP_THEME_COLOR_KEY } from '../constants/theme';
import { APP_THEME_MODE_TYPE } from '../enums';

export const getAppCssColorVar = () => {
  const colorVarList = {};

  Object.keys(APP_THEME_COLOR_KEY).map((a) => {
    const value = APP_THEME_COLOR_KEY[a];

    colorVarList[a] = `var(${value})`;

    return a;
  });

  return colorVarList;
};

export const getAppThemeMode = (appThemeMode) => {
  // compatible with both renderer and main process
  const { shouldUseDarkColors } =
    remote?.nativeTheme ?? remote?.BrowserWindow.nativeTheme ?? {};

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
