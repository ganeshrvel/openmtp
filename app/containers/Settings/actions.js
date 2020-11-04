import omitLodash from 'lodash/omit';
import prefixer from '../../utils/reducerPrefixer';
import { settingsStorage } from '../../utils/storageHelper';
import { initialState } from './reducers';

const prefix = '@@Settings';
const actionTypesList = [
  'TOGGLE_SETTINGS',
  'FRESH_INSTALL',
  'SET_ONBOARDING',
  'HIDE_HIDDEN_FILES',
  'FILE_EXPLORER_LISTING_TYPE',
  'COMMON_SETTINGS',
  'COPY_JSON_FILE_TO_SETTINGS',
];

const excludeItemsFromSettingsFile = ['toggleSettings'];

export const actionTypes = prefixer(prefix, actionTypesList);

export function toggleSettings(data) {
  return {
    type: actionTypes.TOGGLE_SETTINGS,
    payload: data,
  };
}

export function freshInstall({ ...data }, getState) {
  const { isFreshInstall } = data;

  return (dispatch) => {
    dispatch({
      type: actionTypes.FRESH_INSTALL,
      payload: isFreshInstall,
    });
    dispatch(copySettingsToJsonFile(getState));
  };
}

export function setOnboarding({ ...data }, getState) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.SET_ONBOARDING,
      payload: data,
    });
    dispatch(copySettingsToJsonFile(getState));
  };
}

export function hideHiddenFiles({ ...data }, deviceType, getState) {
  const { value } = data;

  return (dispatch) => {
    dispatch({
      type: actionTypes.HIDE_HIDDEN_FILES,
      deviceType,
      payload: value,
    });
    dispatch(copySettingsToJsonFile(getState));
  };
}

export function fileExplorerListingType({ ...data }, deviceType, getState) {
  const { value } = data;

  return (dispatch) => {
    dispatch({
      type: actionTypes.FILE_EXPLORER_LISTING_TYPE,
      deviceType,
      payload: value,
    });
    dispatch(copySettingsToJsonFile(getState));
  };
}

// @param [key]: settings key name
// @param [value]: settings value
export function setCommonSettings({ key, value }, deviceType, getState) {
  if (typeof initialState[key] === 'undefined') {
    // eslint-disable-next-line no-throw-literal
    throw `invalid settings key: ${key}`;
  }

  return (dispatch) => {
    dispatch({
      type: actionTypes.COMMON_SETTINGS,
      deviceType,
      payload: {
        key,
        value,
      },
    });

    dispatch(copySettingsToJsonFile(getState));
  };
}

export function copySettingsToJsonFile(getState) {
  return (_) => {
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
      ...data,
    },
  };
}
