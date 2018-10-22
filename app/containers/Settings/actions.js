'use strict';
import { log } from '@Log';
import prefixer from '../../utils/reducerPrefixer.js';
import { readFileSync, writeFileAsync } from '../../api/sys/fileOps';
import { PATHS } from '../../utils/paths';

const prefix = '@@Settings';
const actionTypesList = [
  'TOGGLE_SETTINGS',
  'HIDE_HIDDEN_FILES',
  'COPY_JSON_FILE_TO_SETTINGS'
];

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
    dispatch(copySettingsToJsonFile(getState().Settings));
    dispatch({
      type: actionTypes.HIDE_HIDDEN_FILES,
      deviceType,
      payload: toggle
    });
  };
}

export function copySettingsToJsonFile(getState) {
  try {
    //const settingFileJson = readFileSync({ filePath: PATHS.settingFile });
    //const _settingsState = getState().Settings;
    console.log(getState);
    /* const appendData = {
      ...settingFileJson,
      ..._settingsState
    };

    writeFileAsync({
      filePath: PATHS.settingFile,
      text: JSON.stringify({ appendData })
    });*/
  } catch (e) {
    log.error(e, `Settings -> Actions -> copySettingsToJsonFile`);
  }
}

export function copyJsonFileToSettings({ ...data }) {
  return {
    type: actionTypes.COPY_JSON_FILE_TO_SETTINGS,
    payload: {
      ...data
    }
  };
}
