'use strict';
import prefixer from '../../utils/reducerPrefixer.js';
import {
  asyncReadLocalDir,
  asyncReadMtpDir,
  fetchMtpStorageOptions
} from '../../api/sys';
import { log } from '@Log';
import { throwAlert } from '../Alerts/actions';
import { deviceTypeConst } from '../../constants';
import {
  processMtpBuffer,
  processLocalBuffer
} from '../../utils/processBufferOutput';
import { isArraysEqual } from '../../utils/funcs';

const prefix = '@@Home';
const actionTypesList = [
  'REQ_LOAD',
  'RES_LOAD',
  'FAIL_LOAD',
  'SET_CURRENT_BROWSE_PATH',
  'SET_SORTING_DIR_LISTS',
  'SET_SELECTED_DIR_LISTS',
  'FETCH_DIR_LIST',
  'SET_MTP_ERRORS',
  'SET_MTP_STATUS',
  'SET_CONTEXT_MENU_POS',
  'CLEAR_CONTEXT_MENU_POS',
  'CHANGE_MTP_STORAGE',
  'SET_FILE_TRANSFER_CLIPBOARD',
  'SET_FILE_TRANSFER_PROGRESS',
  'CLEAR_FILE_TRANSFER'
];

export const actionTypes = prefixer(prefix, actionTypesList);

export function setSortingDirLists(data, deviceType) {
  return {
    type: actionTypes.SET_SORTING_DIR_LISTS,
    deviceType,
    payload: {
      ...data
    }
  };
}

export function setSelectedDirLists(data, deviceType) {
  return {
    type: actionTypes.SET_SELECTED_DIR_LISTS,
    deviceType,
    payload: {
      ...data
    }
  };
}

export function setCurrentBrowsePath(path, deviceType) {
  return {
    type: actionTypes.SET_CURRENT_BROWSE_PATH,
    deviceType,
    payload: path
  };
}

function _fetchDirList(data, deviceType) {
  return {
    type: actionTypes.FETCH_DIR_LIST,
    deviceType,
    payload: {
      nodes: data || []
    }
  };
}

export function getMtpStoragesListSelected(state) {
  if (
    typeof Object.keys(state.mtpStoragesList).length === 'undefined' ||
    Object.keys(state.mtpStoragesList).length < 1
  ) {
    return null;
  }

  const mtpStoragesList = state.mtpStoragesList;
  const mtpStoragesListKeys = Object.keys(mtpStoragesList);

  for (let i in mtpStoragesListKeys) {
    const itemKey = mtpStoragesListKeys[i];
    if (mtpStoragesList[itemKey].selected) {
      return itemKey;
    }
  }

  return null;
}

export function setMtpStorageOptions(
  { ...fetchDirArgs },
  deviceType,
  { ...deviceChangeCheck },
  getState
) {
  return async dispatch => {
    try {
      const { error, stderr, data } = await fetchMtpStorageOptions();
      dispatch(
        processMtpOutput({
          deviceType,
          error,
          stderr,
          data,
          callback: a => {
            let changeMtpIdsFlag = true;
            if (
              Object.keys(deviceChangeCheck).length > 0 &&
              deviceChangeCheck.changeMtpStorageIdsOnlyOnDeviceChange &&
              Object.keys(deviceChangeCheck.mtpStoragesList).length > 0 &&
              isArraysEqual(
                Object.keys(data),
                Object.keys(deviceChangeCheck.mtpStoragesList)
              )
            ) {
              changeMtpIdsFlag = false;
            }

            if (changeMtpIdsFlag) {
              dispatch(changeMtpStorage({ ...data }));
            }
            dispatch(fetchDirList({ ...fetchDirArgs }, deviceType, getState));
          }
        })
      );
    } catch (e) {
      log.error(e);
    }
  };
}

export function changeMtpStorage({ ...data }) {
  return {
    type: actionTypes.CHANGE_MTP_STORAGE,
    payload: data
  };
}

export function setMtpStatus(data) {
  return {
    type: actionTypes.SET_MTP_STATUS,
    payload: data
  };
}

export function setContextMenuPos({ ...data }, deviceType) {
  return {
    type: actionTypes.SET_CONTEXT_MENU_POS,
    deviceType,
    payload: {
      ...data
    }
  };
}

export function clearContextMenuPos(deviceType) {
  return {
    type: actionTypes.CLEAR_CONTEXT_MENU_POS,
    deviceType
  };
}

export function processMtpOutput({
  deviceType,
  error,
  stderr,
  data,
  callback
}) {
  return dispatch => {
    try {
      const {
        status: mtpStatus,
        error: mtpError,
        throwAlert: mtpThrowAlert
      } = processMtpBuffer({ error, stderr });

      dispatch(setMtpStatus(mtpStatus));

      if (!mtpStatus) {
        dispatch(_fetchDirList([], deviceType));
        dispatch(setSelectedDirLists({ selected: [] }, deviceType));
      }

      if (mtpError) {
        log.error(mtpError, 'processMtpOutput');
        if (mtpThrowAlert) {
          dispatch(throwAlert({ message: mtpError.toString() }));
        }
        return false;
      }

      callback();
    } catch (e) {
      log.error(e);
    }
  };
}

export function processLocalOutput({
  deviceType,
  error,
  stderr,
  data,
  callback
}) {
  return dispatch => {
    try {
      const {
        error: localError,
        throwAlert: localThrowAlert
      } = processLocalBuffer({ error, stderr });

      if (localError) {
        log.error(localError, 'processLocalOutput');

        if (localThrowAlert) {
          dispatch(throwAlert({ message: localError.toString() }));
        }
        return false;
      }

      callback();
    } catch (e) {
      log.error(e);
    }
  };
}

export function fetchDirList({ ...args }, deviceType, getState) {
  try {
    switch (deviceType) {
      case deviceTypeConst.local:
        return async dispatch => {
          const { error, data } = await asyncReadLocalDir({ ...args });

          if (error) {
            log.error(error, 'fetchDirList -> asyncReadLocalDir');
            dispatch(
              throwAlert({ message: `Unable fetch data from the Local disk.` })
            );
            return;
          }

          dispatch(_fetchDirList(data, deviceType));
          dispatch(setCurrentBrowsePath(args.filePath, deviceType));
          dispatch(setSelectedDirLists({ selected: [] }, deviceType));
        };

        break;
      case deviceTypeConst.mtp:
        return async dispatch => {
          const mtpStoragesListSelected = getMtpStoragesListSelected(
            getState().Home
          );

          const { error, stderr, data } = await asyncReadMtpDir({
            ...args,
            mtpStoragesListSelected
          });

          dispatch(
            processMtpOutput({
              deviceType,
              error,
              stderr,
              data,
              callback: a => {
                dispatch(_fetchDirList(data, deviceType));
                dispatch(setSelectedDirLists({ selected: [] }, deviceType));
                dispatch(setCurrentBrowsePath(args.filePath, deviceType));
              }
            })
          );
        };

        break;
      default:
        break;
    }
  } catch (e) {
    log.error(e);
  }
}

export function setFileTransferClipboard({ ...data }) {
  return {
    type: actionTypes.SET_FILE_TRANSFER_CLIPBOARD,
    payload: {
      ...data
    }
  };
}

export function setFileTransferProgress({ ...data }) {
  return {
    type: actionTypes.SET_FILE_TRANSFER_PROGRESS,
    payload: {
      ...data
    }
  };
}

export function clearFileTransfer() {
  return {
    type: actionTypes.CLEAR_FILE_TRANSFER
  };
}

export function reqLoadHome() {
  return {
    type: actionTypes.REQ_LOAD
  };
}

export function failLoadHome(e) {
  return {
    type: actionTypes.FAIL_LOAD,
    payload: {
      error: e
    }
  };
}
