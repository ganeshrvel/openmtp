import { remote } from 'electron';
import { APP_THEME_COLOR_KEY } from '../constants/theme';
import { THEME_MODE_TYPE } from '../enums';

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
    case THEME_MODE_TYPE.dark:
      return appThemeMode;

    case THEME_MODE_TYPE.light:
      return appThemeMode;

    default:
      if (shouldUseDarkColors) {
        return THEME_MODE_TYPE.dark;
      }

      return THEME_MODE_TYPE.light;
  }
};
