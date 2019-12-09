import { getAppCssColorVar } from '../utils/theme';

// app theme css style variables key
export const APP_THEME_COLOR_KEY = {
  bgColor: '--app-bg-color',
  primaryMainColor: '--app-primary-main-color',
  secondaryMainColor: '--app-secondary-main-color',
  backgroundPaperColor: '--app-background-paper-color',
  nativeSystemColor: '--app-native-system-color',
  tableHeaderFooterBgColor: '--app-table-header-footer-bg-color',
  fileExplorerThinLineDividerColor:
    '--app-file-explorer-thin-line-divider-color',
  lightText1Color: '--app-light-text-1-color'
};

// app theme css style variables value.
// outputted as {bgColor: `var(--app-bg-color)` }
export const APP_THEME_COLOR_VAR = getAppCssColorVar();
