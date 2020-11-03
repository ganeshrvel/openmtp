import { APP_THEME_COLOR_VAR } from '../../containers/App/styles';

// common styling variable object which can be imported by components
export default (_) => {
  return {
    sizes: {
      toolbarHeight: 64,
      sidebarAreaPaneWidth: 300,
      sidebarAreaPaddingTop: 40,
    },
    styles: {
      bgColor: APP_THEME_COLOR_VAR.bgColor,
      primaryColor: {
        main: APP_THEME_COLOR_VAR.primaryMainColor,
      },
      secondaryColor: {
        main: APP_THEME_COLOR_VAR.secondaryMainColor,
      },
      background: {
        paper: APP_THEME_COLOR_VAR.paperBgColor,
      },
      icons: {
        navbarRegular: APP_THEME_COLOR_VAR.contrastPrimaryMainColor,
        disabled: APP_THEME_COLOR_VAR.disabledBgColor,
      },
      regularFontSize: 14,
      nativeSystemColor: APP_THEME_COLOR_VAR.nativeSystemColor,
      tableHeaderFooterBgColor: APP_THEME_COLOR_VAR.tableHeaderFooterBgColor,
      fileExplorerThinLineDividerColor:
        APP_THEME_COLOR_VAR.fileExplorerThinLineDividerColor,
      lightText1Color: APP_THEME_COLOR_VAR.lightText1Color,
    },
  };
};
