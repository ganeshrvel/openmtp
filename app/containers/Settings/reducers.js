'use strict';
import { actionTypes } from './actions';
import { deviceTypeConst } from '../../constants';

export const initialState = {
  toggleSettings: false,
  hideHiddenFiles: {
    [deviceTypeConst.local]: true,
    [deviceTypeConst.mtp]: true
  }
};

export default function Settings(state = initialState, action) {
  let { type, payload, deviceType = null } = action;
  switch (type) {
    case actionTypes.TOGGLE_SETTINGS:
      return {
        ...state,
        toggleSettings: payload
      };
      
    case actionTypes.HIDE_HIDDEN_FILES:
      return {
        ...state,
        hideHiddenFiles: {
          ...state.hideHiddenFiles,
          [deviceType]: payload
        }
      };
    default:
      return state;
  }
}
