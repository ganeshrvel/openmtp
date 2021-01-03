import { actionTypes } from './actions';

export const initialState = {
  message: null,
  autoHideDuration: 2500, // in ms
  variant: `error`,
};

export default function Alerts(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case actionTypes.THROW_ALERT:
      return {
        ...state,
        ...payload,
      };
    case actionTypes.CLEAR_ALERT:
      return {
        ...state,
        ...initialState,
      };
    default:
      return state;
  }
}
