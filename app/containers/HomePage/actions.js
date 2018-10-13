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

const prefix = '@@Home';
const actionTypesList = [
  'REQ_LOAD',
  'RES_LOAD',
  'FAIL_LOAD',
  'SET_SELECTED_PATH',
  'SET_SORTING_DIR_LISTS',
  'SET_SELECTED_DIR_LISTS',
  'FETCH_DIR_LIST',
  'SET_MTP_ERRORS',
  'SET_MTP_STATUS',
  'SET_CONTEXT_MENU_POS',
  'CLEAR_CONTEXT_MENU_POS',
  'CHANGE_MTP_STORAGE'
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

export function setSelectedPath(path, deviceType) {
  return {
    type: actionTypes.SET_SELECTED_PATH,
    deviceType,
    payload: path
  };
}

function _fetchDirList(data, deviceType) {
  return {
    type: actionTypes.FETCH_DIR_LIST,
    deviceType,
    payload: {
      nodes: data
    }
  };
}

export function setMtpStorageOptions({ ...args }, deviceType) {
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
            dispatch(changeMtpStorage({ ...data }));
            dispatch(fetchDirList({ ...args }, deviceType));
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

export function fetchDirList({ ...args }, deviceType) {
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
          dispatch(setSelectedPath(args.filePath, deviceType));
          dispatch(setSelectedDirLists({ selected: [] }, deviceType));
        };

        break;
      case deviceTypeConst.mtp:
        return async dispatch => {
          const { error, stderr, data } = await asyncReadMtpDir({ ...args });

          dispatch(
            processMtpOutput({
              deviceType,
              error,
              stderr,
              data,
              callback: a => {
                dispatch(_fetchDirList(data, deviceType));
                dispatch(setSelectedDirLists({ selected: [] }, deviceType));
                dispatch(setSelectedPath(args.filePath, deviceType));
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
