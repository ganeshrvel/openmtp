import { getAppCssColorVar } from '../utils/theme';

// app theme css style variables key
export const APP_THEME_COLOR_KEY = {
  appBgColor: '--app-bg-color',
  appPrimaryMainColor: '--app-primary-main-color',
  appSecondaryMainColor: '--app-secondary-main-color',
  appBackgroundPaperColor: '--app-background-paper-color',
  appNativeSystemColor: '--app-native-system-color',
  appTableHeaderFooterBgColor: '--app-table-header-footer-bg-color',
  appBorderThinDividerColor: '--app-border-thin-divider-color',
  appTextLightColor: '--app-text-light-color'
};

// app theme css style variables value.
// outputted as {appBgColor: `var(--app-bg-color)` }
export const APP_THEME_COLOR_VAR = getAppCssColorVar();
