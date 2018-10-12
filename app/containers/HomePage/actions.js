'use strict';
import prefixer from '../../utils/reducerPrefixer.js';
import { asyncReadLocalDir, asyncReadMtpDir } from '../../api/sys';
import { log } from '@Log';
import { throwAlert } from '../Alerts/actions';
import { deviceTypeConst } from '../../constants';
import processMtpBuffer from '../../utils/processMtpBuffer';

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
  'CLEAR_CONTEXT_MENU_POS'
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
          dispatch(throwAlert({ message: mtpError }));
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
      if (error) {
        log.error(error, 'processLocalOutput');
        dispatch(throwAlert({ message: error.toString() }));
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
