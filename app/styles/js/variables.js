'use strict';

import { APP_THEME_COLOR_VAR } from '../../constants/theme';

// common styling variable object which can be imported by components
export default _ => {
  return {
    sizes: {
      toolbarHeight: 64,
      sidebarAreaPaneWidth: 300,
      sidebarAreaPaddingTop: 40
    },
    styles: {
      bgColor: APP_THEME_COLOR_VAR.bgColor,
      primaryColor: {
        main: APP_THEME_COLOR_VAR.primaryMainColor
      },
      secondaryColor: {
        main: APP_THEME_COLOR_VAR.secondaryMainColor
      },
      background: {
        paper: APP_THEME_COLOR_VAR.backgroundPaperColor
      },
      regularFontSize: 14,
      nativeSystemColor: APP_THEME_COLOR_VAR.nativeSystemColor,
      tableHeaderFooterBgColor: APP_THEME_COLOR_VAR.tableHeaderFooterBgColor,
      fileExplorerThinLineDividerColor:
        APP_THEME_COLOR_VAR.fileExplorerThinLineDividerColor,
      lightText1Color: APP_THEME_COLOR_VAR.lightText1Color
    }
  };
};

// App skeleton theme color constants
export const APP_BASIC_THEME_COLORS = {
  light: {
    primaryMain: '#fff',
    secondaryMain: '#007af5'
  },
  dark: {
    primaryMain: '#242424',
    secondaryMain: '#007af5'
  }
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
