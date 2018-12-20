'use strict';
import { actionTypes } from './actions';
import { DEVICES_TYPE_CONST } from '../../constants';

export const initialState = {
  freshInstall: false,
  toggleSettings: false,
  enableAutoUpdateCheck: true,
  enableAnalytics: true,
  hideHiddenFiles: {
    [DEVICES_TYPE_CONST.local]: true,
    [DEVICES_TYPE_CONST.mtp]: true
  }
};

export default function Settings(state = initialState, action) {
  let { type, payload, deviceType = null } = action;
  switch (type) {
    case actionTypes.FRESH_INSTALL:
      return {
        ...state,
        freshInstall: payload
      };

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

    case actionTypes.ENABLE_AUTO_UPDATE_CHECK:
      return {
        ...state,
        enableAutoUpdateCheck: payload
      };

    case actionTypes.ENABLE_ANALYTICS:
      return {
        ...state,
        enableAnalytics: payload
      };

    case actionTypes.COPY_JSON_FILE_TO_SETTINGS:
      return {
        ...state,
        ...payload
      };
      
    default:
      return state;
  }
}
