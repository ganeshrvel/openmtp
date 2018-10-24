'use strict';
import { log } from '@Log';
import prefixer from '../../utils/reducerPrefixer.js';
import omitLodash from 'lodash/omit';
import { settingsStorage } from '../../utils/storageHelper';

const prefix = '@@Settings';
const actionTypesList = [
  'TOGGLE_SETTINGS',
  'HIDE_HIDDEN_FILES',
  'COPY_JSON_FILE_TO_SETTINGS'
];

const excludeItemsFromSettingsFile = ['toggleSettings'];

export const actionTypes = prefixer(prefix, actionTypesList);

export function toggleSettings(data) {
  return {
    type: actionTypes.TOGGLE_SETTINGS,
    payload: data
  };
}

export function hideHiddenFiles({ ...data }, deviceType, getState) {
  const { toggle } = data;

  return dispatch => {
    dispatch({
      type: actionTypes.HIDE_HIDDEN_FILES,
      deviceType,
      payload: toggle
    });
    dispatch(copySettingsToJsonFile(getState));
  };
}

export function copySettingsToJsonFile(getState) {
  return dispatch => {
    const settingsState = getState().Settings ? getState().Settings : {};
    const filteredSettings = omitLodash(
      settingsState,
      excludeItemsFromSettingsFile
    );
    settingsStorage.setAll({ ...filteredSettings });
  };
}

export function copyJsonFileToSettings({ ...data }) {
  return {
    type: actionTypes.COPY_JSON_FILE_TO_SETTINGS,
    payload: {
      ...data
    }
  };
}
