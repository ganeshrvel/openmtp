import { createSelector } from 'reselect';
import { initialState } from './reducers';
import { getAppThemeMode } from '../../utils/theme';

const make = (state, _) => (state ? state.Settings : {});

export const makeFreshInstall = createSelector(make, (state) =>
  state ? state.freshInstall : initialState.freshInstall
);

export const makeOnboarding = createSelector(make, (state) =>
  state ? state.onboarding : initialState.onboarding
);

export const makeToggleSettings = createSelector(make, (state) =>
  state ? state.toggleSettings : initialState.toggleSettings
);

export const makeHideHiddenFiles = createSelector(make, (state) =>
  state ? state.hideHiddenFiles : initialState.hideHiddenFiles
);

export const makeFileExplorerListingType = createSelector(make, (state) =>
  state ? state.fileExplorerListingType : initialState.fileExplorerListingType
);

export const makeEnableAutoUpdateCheck = createSelector(make, (state) =>
  state ? state.enableAutoUpdateCheck : initialState.enableAutoUpdateCheck
);

export const makeEnableBackgroundAutoUpdate = createSelector(make, (state) =>
  state
    ? state.enableBackgroundAutoUpdate
    : initialState.enableBackgroundAutoUpdate
);

export const makeEnablePrereleaseUpdates = createSelector(make, (state) =>
  state ? state.enablePrereleaseUpdates : initialState.enablePrereleaseUpdates
);

export const makeEnableAnalytics = createSelector(make, (state) =>
  state ? state.enableAnalytics : initialState.enableAnalytics
);

export const makeEnableStatusBar = createSelector(make, (state) =>
  state ? state.enableStatusBar : initialState.enableStatusBar
);

// returns the app theme mode setting value (light, dark, auto)
export const makeAppThemeModeSettings = createSelector(make, (state) =>
  state ? state.appThemeMode : initialState.appThemeMode
);

// returns the app theme mode (light, dark)
export const makeAppThemeMode = createSelector(make, (state) => {
  const theme = state ? state.appThemeMode : initialState.appThemeMode;

  return getAppThemeMode(theme);
});
