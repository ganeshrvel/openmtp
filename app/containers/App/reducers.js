'use strict';
import { PATHS } from '../../utils/paths';
import { actionTypes } from './actions';

export const initialState = {
  /* <Meta Data> */
  ___isDefault: true,
  ___isLoading: false,
  ___timeGenerated: null,
  ___timeLastModified: null,
  ___error: null,
  /* </Meta Data> */
  
};

export default function App(state = initialState, action) {
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
