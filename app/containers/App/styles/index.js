'use strict';

import {
  variables,
  materialUiSkeletonThemeStyles,
  mixins
} from '../../../styles/js';
import { APP_THEME_COLOR_KEY } from '../../../constants/theme';

// Styles for App/index.jsx component
export const styles = _ => {
  return {
    root: {},
    noProfileError: {
      textAlign: `center`,
      ...mixins().center,
      ...mixins().absoluteCenter
    }
  };
};

export const materialUiTheme = ({ ...args }) => {
  const { appThemeMode } = args;

  return {
    palette: {
      type: appThemeMode,
      primary: {
        ...materialUiSkeletonThemeStyles({ appThemeMode }).primaryColor
      },
      secondary: {
        ...materialUiSkeletonThemeStyles({ appThemeMode }).secondaryColor
      },
      background: {
        ...materialUiSkeletonThemeStyles({ appThemeMode }).background
      }
    },
    typography: {
      useNextVariants: true,
      fontSize: variables().regularFontSize,
      fontFamily: [
        'Roboto',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"'
      ].join(',')
    },

    overrides: {}
  };
};

export const appBodyStylesStore = ({ appThemeMode }) => {
  const appStyle = materialUiSkeletonThemeStyles({ appThemeMode });

  // light color themes
  const styleList = {
    [APP_THEME_COLOR_KEY.appTableHeaderFooterBgColor]: `#fbfbfb`
  };

  switch (appThemeMode) {
    case 'dark':
      styleList[APP_THEME_COLOR_KEY.appTableHeaderFooterBgColor] = `#313131`;
      break;

    case 'light':
    default:
      break;
  }

  return {
    [APP_THEME_COLOR_KEY.appBgColor]: appStyle.primaryColor.main,
    [APP_THEME_COLOR_KEY.appPrimaryMainColor]: appStyle.primaryColor.main,
    [APP_THEME_COLOR_KEY.appSecondaryMainColor]: appStyle.secondaryColor.main,
    [APP_THEME_COLOR_KEY.appBackgroundPaperColor]: appStyle.background.paper,
    [APP_THEME_COLOR_KEY.appNativeSystemColor]: `#ececec`,
    [APP_THEME_COLOR_KEY.appBorderThinDividerColor]: `solid 1px var(--black-transparent-12,rgba(0,0,0,.12))`,
    [APP_THEME_COLOR_KEY.appTextLightColor]: `rgba(0, 0, 0, 0.64)`,
    ...styleList
  };
};
