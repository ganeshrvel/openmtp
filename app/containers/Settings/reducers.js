'use strict';
import { actionTypes } from './actions';
import { deviceType } from '../../constants';

export const initialState = {
  toggleHiddenFiles: {
    [deviceType.local]: true,
    [deviceType.mtp]: true
  }
};

export default function Settings(state = initialState, action) {
  let { type, payload, deviceType = null } = action;
  switch (type) {
    case actionTypes.TOGGLE_HIDDEN_FILES:
      return {
        ...state,
        toggleHiddenFiles: {
          ...state.toggleHiddenFiles,
          [deviceType]: {
            ...state.directoryLists[deviceType],
            payload
          }
        }
      };
    default:
      return state;
  }
}
