'use strict';

// eslint-disable-next-line no-unused-vars
import { actionTypes } from './actions';

export const initialState = {};

export default function App(state = initialState, action) {
  // eslint-disable-next-line prefer-const, no-unused-vars
  let { type, payload } = action;
  switch (type) {
    default:
      return state;
  }
}
