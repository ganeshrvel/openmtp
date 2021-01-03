import omitLodash from 'lodash/omit';
import { disposeMtp, initializeMtp } from '../HomePage/actions';
import prefixer from '../../helpers/reducerPrefixer';
import { settingsStorage } from '../../helpers/storageHelper';
import { initialState } from './reducers';
import { checkIf } from '../../utils/checkIf';
import { MTP_MODE } from '../../enums';
import { DEVICES_DEFAULT_PATH } from '../../constants';
import { analyticsService } from '../../services/analytics';
import { EVENT_TYPE } from '../../enums/events';

const prefix = '@@Settings';
const actionTypesList = [
  'TOGGLE_SETTINGS',
  'FRESH_INSTALL',
  'SET_ONBOARDING',
  'HIDE_HIDDEN_FILES',
  'FILE_EXPLORER_LISTING_TYPE',
  'SET_FILES_PREPROCESSING_BEFORE_TRANSFER',
  'COMMON_SETTINGS',
  'COPY_JSON_FILE_TO_SETTINGS',
];

const excludeItemsFromSettingsFile = ['toggleSettings'];

export const actionTypes = prefixer(prefix, actionTypesList);

export function toggleSettings(data) {
  const dialogStatus = data ? 'OPEN' : 'CLOSE';

  analyticsService.sendEvent(
    EVENT_TYPE[`TOOLBAR_SETTINGS_DIALOG_${dialogStatus}`],
    {}
  );

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

    analyticsService.sendEvent(EVENT_TYPE.TOOLBAR_SETTINGS_CHANGE, {
      key: 'isFreshInstall',
      value: isFreshInstall,
    });
  };
}

export function setOnboarding({ ...data }, getState) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.SET_ONBOARDING,
      payload: data,
    });

    dispatch(copySettingsToJsonFile(getState));

    analyticsService.sendEvent(EVENT_TYPE.TOOLBAR_SETTINGS_CHANGE, {
      key: 'onboarding',
      value: data,
    });
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

    analyticsService.sendEvent(EVENT_TYPE.TOOLBAR_SETTINGS_CHANGE, {
      key: 'hideHiddenFiles',
      value,
      deviceType,
    });
  };
}

export function setFilesPreprocessingBeforeTransfer({ ...data }, getState) {
  const { value, direction } = data;

  return (dispatch) => {
    dispatch({
      type: actionTypes.SET_FILES_PREPROCESSING_BEFORE_TRANSFER,
      deviceType: null,
      payload: { value, direction },
    });

    dispatch(copySettingsToJsonFile(getState));

    analyticsService.sendEvent(EVENT_TYPE.TOOLBAR_SETTINGS_CHANGE, {
      key: 'filesPreprocessingBeforeTransfer',
      value,
      direction,
    });
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

    analyticsService.sendEvent(EVENT_TYPE.TOOLBAR_SETTINGS_CHANGE, {
      key: 'fileExplorerListingType',
      value,
      deviceType,
    });
  };
}

export function selectMtpMode(
  { value, reportEvent = true },
  deviceType,
  getState
) {
  const { hideHiddenFiles, mtpMode } = getState().Settings;

  checkIf(deviceType, 'string');
  checkIf(getState, 'function');
  checkIf(hideHiddenFiles, 'object');
  checkIf(mtpMode, 'string');

  const key = 'mtpMode';

  if (reportEvent) {
    analyticsService.sendEvent(EVENT_TYPE.MTP_MODE_SELECTED, {
      'Current MTP Mode': mtpMode,
      'Selected MTP Mode': value,
    });
  }

  return async (dispatch) => {
    // dont proceed if the mtp wasn't changed
    if (mtpMode === value) {
      return;
    }

    // reset the mtp device if it was previously connected using kalam
    if (mtpMode === MTP_MODE.kalam) {
      const { error, stderr } = await new Promise((resolve) => {
        dispatch(
          disposeMtp(
            {
              deviceType,
              onSuccess: ({ error, stderr, data }) => {
                resolve({ error, stderr, data });
              },
              onError: ({ error, stderr, data }) => {
                resolve({ error, stderr, data });
              },
            },
            getState
          )
        );
      });

      if (error || stderr) {
        return;
      }
    }

    await new Promise((resolve) => {
      dispatch(
        setCommonSettings(
          {
            key,
            value,
            onSuccess: () => {
              resolve();
            },
          },
          deviceType,
          getState
        )
      );
    });

    dispatch(
      initializeMtp(
        {
          deviceType,
          filePath: DEVICES_DEFAULT_PATH[deviceType],
          ignoreHidden: hideHiddenFiles[deviceType],
          changeLegacyMtpStorageOnlyOnDeviceChange: true,
        },
        getState
      )
    );
  };
}

// @param [key]: settings key name
// @param [value]: settings value
export function setCommonSettings(
  { key, value, onSuccess },
  deviceType,
  getState
) {
  if (typeof initialState[key] === 'undefined') {
    // eslint-disable-next-line no-throw-literal
    throw `invalid settings key: ${key}`;
  }

  return async (dispatch) => {
    // key == [mtpMode] is handled separately, so skip it
    if (key !== 'mtpMode') {
      if (key === 'enableAnalytics' && !value) {
        // if the [key] == [enableAnalytics] and it is toggled on, report it
        analyticsService.sendEvent(EVENT_TYPE.TOOLBAR_SETTINGS_CHANGE, {
          key,
          value,
          isCommonSettings: true,
          deviceType,
        });
      }
    }

    dispatch({
      type: actionTypes.COMMON_SETTINGS,
      deviceType,
      payload: {
        key,
        value,
      },
    });

    dispatch(
      copySettingsToJsonFile(getState, () => {
        if (onSuccess) {
          onSuccess();
        }
      })
    );

    // key == [mtpMode] is handled separately, so skip it
    if (key !== 'mtpMode') {
      // if the [key] == [enableAnalytics] and it is toggled off, report it
      // log for all other keys
      // note: if [enableAnalytics] is false then reporting is automatically disabled by [AnalyticsService] itself.
      if (key !== 'enableAnalytics' || (key === 'enableAnalytics' && value)) {
        analyticsService.sendEvent(EVENT_TYPE.TOOLBAR_SETTINGS_CHANGE, {
          key,
          value,
          isCommonSettings: true,
          deviceType,
        });
      }
    }
  };
}

export function copySettingsToJsonFile(getState, onSuccess) {
  return (_) => {
    const settingsState = getState().Settings ? getState().Settings : {};
    const filteredSettings = omitLodash(
      settingsState,
      excludeItemsFromSettingsFile
    );

    settingsStorage.setAll({ ...filteredSettings });

    if (onSuccess) {
      onSuccess();
    }
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
