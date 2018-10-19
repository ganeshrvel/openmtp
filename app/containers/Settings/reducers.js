'use strict';
import { actionTypes } from './actions';
import { deviceTypeConst } from '../../constants';

export const initialState = {
  hideHiddenFiles: {
    [deviceTypeConst.local]: true,
    [deviceTypeConst.mtp]: true
  }
};

export default function Settings(state = initialState, action) {
  let { type, payload, deviceTypeConst = null } = action;
  switch (type) {
    case actionTypes.HIDE_HIDDEN_FILES:
      return {
        ...state,
        hideHiddenFiles: {
          ...state.hideHiddenFiles,
          [deviceTypeConst]: payload
        }
      };
    default:
      return state;
  }
}
