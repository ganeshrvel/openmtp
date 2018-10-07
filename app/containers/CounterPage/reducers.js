'use strict';

import { actionTypes } from './actions';

export const initialState = {
  /* <Meta Data> */
  ___isDefault: true,
  ___isLoading: false,
  ___timeGenerated: null,
  ___timeLastModified: null,
  ___error: null,
  /* </Meta Data> */
  
  count: 0,
  demoFetchData: null
};

export default function Counter(state = initialState, action) {
  let { type, payload } = action;
  switch (type) {
    /* <Meta Data> */
    case actionTypes.REQ_LOAD:
      return {
        ...state,
        ___isLoading: true
      };
    case actionTypes.RES_LOAD:
      return {
        ...state,
        ...setLoadedMetaData(state)
      };
    case actionTypes.FAIL_LOAD:
      return {
        ...state,
        ___isLoading: false,
        ___error: payload.error
      };
    /* </Meta Data> */

    case actionTypes.INCREMENT_COUNTER:
      return {
        ...state,
        ...setLoadedMetaData(state),
        count: state.count + 1
      };
    case actionTypes.DECREMENT_COUNTER:
      return {
        ...state,
        ...setLoadedMetaData(state),
        count: state.count - 1
      };
    case actionTypes.API_FETCH_DEMO:
      return {
        ...state,
        ...setLoadedMetaData(state),
        demoFetchData: payload.nodes
      };
    default:
      return state;
  }
}

function setLoadedMetaData(state) {
  const ms = Date.now();
  return {
    ___isLoading: false,
    ___isDefault: false,
    ___timeGenerated: state.___timeGenerated ? state.___timeGenerated : ms,
    ___timeLastModified: ms,
    ___error: null
  };
}
