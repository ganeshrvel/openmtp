import { createSelector } from 'reselect';

const make = (state, props) => state.Settings;

export const makeHideHiddenFiles = createSelector(
  make,
  state => state.hideHiddenFiles
);
