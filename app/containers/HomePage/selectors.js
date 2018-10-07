import { createSelector } from 'reselect';

const make = (state, props) => state.Home;
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
export const makeExcluded = createSelector(
  make,
  state => state.directoryLists.queue.excluded
);
export const makeQueueModeOn = createSelector(
  make,
  state => state.directoryLists.queue.queueModeOn
);
export const makeIsLoading = createSelector(make, state => state.___isLoading);
