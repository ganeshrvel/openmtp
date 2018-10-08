import { createSelector } from 'reselect';
import find from 'lodash/find';

const make = (state, props) => state.Home;

export const makeToolbarList = createSelector(make, state => state.toolbarList);
export const makeSidebarFavouriteList = createSelector(
  make,
  state => state.sidebarFavouriteList
);
export const makeDefaultSelectedPath = createSelector(make, state => {
  return find(state.sidebarFavouriteList.top, { selected: true });
});

export const makeNodes = createSelector(
  make,
  state => state.directoryLists.nodes
);
export const makeOrder = createSelector(
  make,
  state => state.directoryLists.order
);
export const makeOrderBy = createSelector(
  make,
  state => state.directoryLists.orderBy
);
export const makeSelected = createSelector(
  make,
  state => state.directoryLists.queue.selected
);

export const makeIsLoading = createSelector(make, state => state.___isLoading);
