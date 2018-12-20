import { createSelector } from 'reselect';
import { initialState } from './reducers';

const make = (state, props) => (state ? state.Settings : {});

export const makeFreshInstall = createSelector(
  make,
  state => (state ? state.freshInstall : initialState.freshInstall)
);

export const makeToggleSettings = createSelector(
  make,
  state => (state ? state.toggleSettings : initialState.toggleSettings)
);

export const makeHideHiddenFiles = createSelector(
  make,
  state => (state ? state.hideHiddenFiles : initialState.hideHiddenFiles)
);

export const makeEnableAutoUpdateCheck = createSelector(
  make,
  state =>
    state ? state.enableAutoUpdateCheck : initialState.enableAutoUpdateCheck
);

export const makeEnableAnalytics = createSelector(
  make,
  state => (state ? state.enableAnalytics : initialState.enableAnalytics)
);
