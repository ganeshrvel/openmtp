import { createSelector } from 'reselect';

const make = (state, props) => state.Settings;

export const makeToggleSettings = createSelector(
  make,
  state => (state ? state.toggleSettings : {})
);

export const makeHideHiddenFiles = createSelector(
  make,
  state => (state ? state.hideHiddenFiles : {})
);
