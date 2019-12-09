'use strict';

import { APP_THEME_COLORS, APP_THEME_VARS } from '../../constants/theme';

// theming used my material ui createMuiTheme
export const appThemeStyles = ({ ...args }) => {
  const { appThemeMode } = args;

  return {
    primaryColor: {
      main: `${APP_THEME_COLORS[appThemeMode].primaryMain}`
    },
    secondaryColor: {
      main: `${APP_THEME_COLORS[appThemeMode].secondaryMain}`
    },
    background: {
      paper: `${APP_THEME_COLORS[appThemeMode].primaryMain}`
    }
  };
};

// common styling variable object which can be imported by components
export default _ => {
  return {
    sizes: {
      toolbarHeight: 64,
      sidebarAreaPaneWidth: 300,
      sidebarAreaPaddingTop: 40
    },
    styles: {
      primaryColor: {
        main: APP_THEME_VARS.appBgColor.value
      },
      secondaryColor: {
        main: APP_THEME_VARS.appSecondaryMainColor.value
      },
      background: {
        paper: APP_THEME_VARS.appBackgroundPaperColor.value
      },
      regularFontSize: 14,
      nativeSystemColor: APP_THEME_VARS.appNativeSystemColor.value,
      tableHeaderFooterBgColor:
        APP_THEME_VARS.appTableHeaderFooterBgColor.value,
      borderThinDividerColor: APP_THEME_VARS.appBorderThinDividerColor.value,
      textLightColor: APP_THEME_VARS.appTextLightColor.value
    }
  };
};
