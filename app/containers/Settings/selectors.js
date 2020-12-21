import { createSelector } from 'reselect';
import { initialState } from './reducers';
import { getAppThemeMode } from '../../helpers/theme';
import { isPrereleaseVersion } from '../../utils/funcs';

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

export const makeEnablePrereleaseUpdates = createSelector(make, (state) => {
  const isPrerelease = isPrereleaseVersion();

  if (isPrerelease) {
    return true;
  }

  return state
    ? state.enablePrereleaseUpdates
    : initialState.enablePrereleaseUpdates;
});

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

// returns the selected mtp mode
export const makeMtpMode = createSelector(make, (state) =>
  state ? state.mtpMode : initialState.mtpMode
);

// returns the selected mtp mode
export const makeFilesPreprocessingBeforeTransfer = createSelector(
  make,
  (state) =>
    state
      ? state.filesPreprocessingBeforeTransfer
      : initialState.filesPreprocessingBeforeTransfer
);

export const makeShowLocalPane = createSelector(make, (state) =>
  state ? state.showLocalPane : initialState.showLocalPane
);

export const makeShowLocalPaneOnLeftSide = createSelector(make, (state) =>
  state ? state.showLocalPaneOnLeftSide : initialState.showLocalPaneOnLeftSide
);

export const makeShowDirectoriesFirst = createSelector(make, (state) =>
  state ? state.showDirectoriesFirst : initialState.showDirectoriesFirst
);

// returns the settings key-value pair
export const makeCommonSettings = createSelector(make, (state) => {
  const _state = state ?? {};

  // sanitize settings data
  const _cleanedState = {};

  Object.keys(_state).map((a) => {
    const item = _state[a];

    if (typeof initialState[a] === 'undefined') {
      return;
    }

    _cleanedState[a] = item;

    return _cleanedState;
  });

  return {
    ...initialState,
    ..._cleanedState,
  };
});
