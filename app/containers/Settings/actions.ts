import omitLodash from 'lodash/omit';
import { action } from 'typesafe-actions';
import prefixer from '../../utils/reducerPrefixer';
import { settingsStorage } from '../../utils/storageHelper';
import {
  CopyJsonFileToSettings,
  SettingsReducersState
} from './types/reducers';
import { GetState, RootState } from '../../types/store';
import { DevicesTypeEnum } from '../../constants/index.td';
import { SettingsActionTypesList } from './types/actions';

const prefix = '@@Settings';

const actionTypesList: SettingsActionTypesList[] = [
  'TOGGLE_SETTINGS',
  'FRESH_INSTALL',
  'SET_ONBOARDING',
  'HIDE_HIDDEN_FILES',
  'FILE_EXPLORER_LISTING_TYPE',
  'ENABLE_AUTO_UPDATE_CHECK',
  'ENABLE_BACKGROUND_AUTO_UPDATE',
  'ENABLE_PRERELEASE_UPDATES',
  'ENABLE_ANALYTICS',
  'ENABLE_STATUS_BAR',
  'COPY_JSON_FILE_TO_SETTINGS'
];

const excludeItemsFromSettingsFile = ['toggleSettings'];

export const actionTypes = prefixer<SettingsActionTypesList>(
  prefix,
  actionTypesList
);

export function toggleSettings(data) {
  return {
    type: actionTypes.TOGGLE_SETTINGS,
    payload: data
  };
}

export function freshInstall({ ...data }, getState: GetState) {
  const { isFreshInstall } = data;

  return dispatch => {
    dispatch({
      type: actionTypes.FRESH_INSTALL,
      payload: isFreshInstall
    });
    dispatch(copySettingsToJsonFile(getState));
  };
}

export function setOnboarding({ ...data }, getState: GetState) {
  return dispatch => {
    dispatch({
      type: actionTypes.SET_ONBOARDING,
      payload: data
    });
    dispatch(copySettingsToJsonFile(getState));
  };
}

export function hideHiddenFiles({ ...data }, deviceType, getState: GetState) {
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

export function fileExplorerListingType(
  { ...data },
  deviceType,
  getState: GetState
) {
  const { type } = data;

  return dispatch => {
    dispatch({
      type: actionTypes.FILE_EXPLORER_LISTING_TYPE,
      deviceType,
      payload: type
    });
    dispatch(copySettingsToJsonFile(getState));
  };
}

export function enableAutoUpdateCheck({ ...data }, getState: GetState) {
  const { toggle } = data;

  return dispatch => {
    dispatch({
      type: actionTypes.ENABLE_AUTO_UPDATE_CHECK,
      payload: toggle
    });
    dispatch(copySettingsToJsonFile(getState));
  };
}

export function enableBackgroundAutoUpdate({ ...data }, getState: GetState) {
  const { toggle } = data;

  return dispatch => {
    dispatch({
      type: actionTypes.ENABLE_BACKGROUND_AUTO_UPDATE,
      payload: toggle
    });
    dispatch(copySettingsToJsonFile(getState));
  };
}

export function enablePrereleaseUpdates({ ...data }, getState: GetState) {
  const { toggle } = data;

  return dispatch => {
    dispatch({
      type: actionTypes.ENABLE_PRERELEASE_UPDATES,
      payload: toggle
    });
    dispatch(copySettingsToJsonFile(getState));
  };
}

export function enableAnalytics({ ...data }, getState: GetState) {
  const { toggle } = data;

  return dispatch => {
    dispatch({
      type: actionTypes.ENABLE_ANALYTICS,
      payload: toggle
    });
    dispatch(copySettingsToJsonFile(getState));
  };
}

export function enableStatusBar({ ...data }, getState: GetState) {
  const { toggle } = data;

  return dispatch => {
    dispatch({
      type: actionTypes.ENABLE_STATUS_BAR,
      payload: toggle
    });
    dispatch(copySettingsToJsonFile(getState));
  };
}

export function copySettingsToJsonFile(getState: GetState) {
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
