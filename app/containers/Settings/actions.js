'use strict';
import prefixer from '../../utils/reducerPrefixer.js';

const prefix = '@@Settings';
const actionTypesList = ['TOGGLE_SETTINGS', 'HIDE_HIDDEN_FILES'];

export const actionTypes = prefixer(prefix, actionTypesList);

export function toggleSettings(data) {
  return {
    type: actionTypes.TOGGLE_SETTINGS,
    payload: data
  };
}

export function hideHiddenFiles({ ...data }, deviceType) {
  const { toggle } = data;
  return {
    type: actionTypes.HIDE_HIDDEN_FILES,
    deviceType,
    payload: toggle
  };
}
