import { createSelector } from 'reselect';

const make = (state, props) => state.App;


export const makeIsLoading = createSelector(make, state => state.___isLoading);
