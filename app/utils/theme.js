import { nativeTheme, remote } from "electron";
import { APP_THEME_MODE_TYPE } from "../enums";
import { undefinedOrNull } from "./funcs";
import { getAppThemeModeSettings } from "../helpers/settings";

// [appThemeModeSettings] is optional
// if [appThemeModeSettings] is not provided then fetch the theme value from the settings
export const getAppThemeMode = (appThemeModeSettings) => {
  // compatible with both renderer and main process
  const { shouldUseDarkColors } = remote?.nativeTheme ?? nativeTheme ?? {};

  let _appThemeModeSettings = appThemeModeSettings;

  if (undefinedOrNull(_appThemeModeSettings)) {
    _appThemeModeSettings = getAppThemeModeSettings();
  }

  switch (_appThemeModeSettings) {
    case APP_THEME_MODE_TYPE.dark:
      return _appThemeModeSettings;

    case APP_THEME_MODE_TYPE.light:
      return _appThemeModeSettings;

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

