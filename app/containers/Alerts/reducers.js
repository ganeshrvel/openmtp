'use strict';

import { actionTypes } from './actions';

export const initialState = {
  message: null,
  autoHideDuration: 6000,
  variant: `error`
};

export default function Alerts(state = initialState, action) {
  // eslint-disable-next-line prefer-const
  let { type, payload } = action;
  switch (type) {
    case actionTypes.THROW_ALERT:
      return {
        ...state,
        ...payload
      };
    case actionTypes.CLEAR_ALERT:
      return {
        ...state,
        ...initialState
      };
    default:
      return state;
  }
}
