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
  'CLEAR_MTP_ERRORS',
  'SET_MTP_STATUS'
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

export function processMtpOutput({
  deviceType,
  error,
  stderr,
  data,
  setSelectedPath
}) {
  return dispatch => {
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
      return null;
    }

    dispatch(_fetchDirList(data, deviceType));
    dispatch(setSelectedDirLists({ selected: [] }, deviceType));

    if (setSelectedPath.trigger) {
      dispatch(
        setSelectedPath(setSelectedPath.filePath, setSelectedPath.deviceType)
      );
    }
  };
}

export function fetchDirList({ ...args }, deviceType) {
  try {
    switch (deviceType) {
      case deviceTypeConst.local:
      default:
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

      case deviceTypeConst.mtp:
        return async dispatch => {
          const { error, stderr, data } = await asyncReadMtpDir({ ...args });

          dispatch(
            processMtpOutput({
              deviceType,
              error,
              stderr,
              data,
              setSelectedPath: {
                trigger: true,
                filePath: args.filePath
              }
            })
          );
        };
    }
  } catch (e) {
    log.error(e, 'fetchDirList');
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
