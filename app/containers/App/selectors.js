import { createSelector } from 'reselect';
import { initialState } from './reducers';

const make = (state, props) => (state ? state.App : {});

export const makeIsLoading = createSelector(
  make,
  state => (state ? state.___isLoading : initialState.___isLoading)
);
