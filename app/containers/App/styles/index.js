'use strict';

import { variables, mixins } from '../../../styles/js';
import {
  APP_BASIC_THEME_COLORS,
  APP_THEME_COLOR_KEY
} from '../../../constants/theme';
import { getAppCssColorVar } from '../../../utils/theme';

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

// theming used my material ui createMuiTheme
export const materialUiSkeletonThemeStyles = ({ ...args }) => {
  const { appThemeMode } = args;

  return {
    primaryColor: {
      main: `${APP_BASIC_THEME_COLORS[appThemeMode].primaryMain}`
    },
    secondaryColor: {
      main: `${APP_BASIC_THEME_COLORS[appThemeMode].secondaryMain}`
    },
    background: {
      paper: `${APP_BASIC_THEME_COLORS[appThemeMode].primaryMain}`
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
    tableHeaderFooterBgColor: `#fbfbfb`,
    lightText1Color: `rgba(0, 0, 0, 0.50)`,
    fileExplorerThinLineDividerColor: `rgba(255, 255, 255,.12)`
  };

  switch (appThemeMode) {
    case 'dark':
      styleList.tableHeaderFooterBgColor = `#313131`;
      styleList.lightText1Color = `rgba(255, 255, 255, 0.50)`;
      styleList.fileExplorerThinLineDividerColor = `rgba(0, 0, 0, .12)`;
      break;

    case 'light':
    default:
      break;
  }

  const mappedStyleList = {};

  Object.keys(styleList).map(a => {
    mappedStyleList[APP_THEME_COLOR_KEY[a]] = styleList[a];

    return a;
  });

  return {
    [APP_THEME_COLOR_KEY.bgColor]: appStyle.primaryColor.main,
    [APP_THEME_COLOR_KEY.primaryMainColor]: appStyle.primaryColor.main,
    [APP_THEME_COLOR_KEY.secondaryMainColor]: appStyle.secondaryColor.main,
    [APP_THEME_COLOR_KEY.backgroundPaperColor]: appStyle.background.paper,
    [APP_THEME_COLOR_KEY.nativeSystemColor]: `#ececec`,
    ...mappedStyleList
  };
};

// app theme css style variables value.
// outputted as {bgColor: `var(--app-bg-color)` }
export const APP_THEME_COLOR_VAR = getAppCssColorVar();
