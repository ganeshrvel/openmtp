import { createSelector } from 'reselect';

const makeCounter = (state, props) => state.Counter;

export const makeCount = createSelector(makeCounter, state => state.count);
export const makeDemoFetchData = createSelector(
  makeCounter,
  state => state.demoFetchData
);
export const makeIsLoading = createSelector(
  makeCounter,
  state => state.___isLoading
);
