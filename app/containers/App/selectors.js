import { createSelector } from 'reselect';

const make = (state, props) => (state ? state.App : {});

export const makeIsLoading = createSelector(
  make,
  state => (state ? state.___isLoading : {})
);
