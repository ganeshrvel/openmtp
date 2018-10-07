import { createSelector } from 'reselect';
import find from 'lodash/find';

const make = (state, props) => state.App;

export const makeToolbarList = createSelector(make, state => state.toolbarList);
export const makeSidebarFavouriteList = createSelector(
  make,
  state => state.sidebarFavouriteList
);
export const makeDefaultSelectedPath = createSelector(make, state => {
  return find(state.sidebarFavouriteList.top, { selected: true });
});
export const makeIsLoading = createSelector(make, state => state.___isLoading);
