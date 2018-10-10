import { createSelector } from 'reselect';

const make = (state, props) => state.Settings;

export const makeToggleHiddenFiles = createSelector(
  make,
  state => state.toggleHiddenFiles
);
