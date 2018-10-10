'use strict';
import prefixer from '../../utils/reducerPrefixer.js';
import { asyncReadLocalDir, asyncReadMtpDir } from '../../api/sys';
import { log } from '@Log';
import { throwAlert } from '../Alerts/actions';
import { deviceType as _deviceType } from '../../constants';

const prefix = '@@Home';
const actionTypesList = [
  'REQ_LOAD',
  'RES_LOAD',
  'FAIL_LOAD',
  'SET_SELECTED_PATH',
  'SET_SORTING_DIR_LISTS',
  'SET_SELECTED_DIR_LISTS',
  'FETCH_DIR_LIST'
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

export function fetchDirList({ ...args }, deviceType) {
  switch (deviceType) {
    case _deviceType.local:
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
      };

    case _deviceType.mtp:
      return async dispatch => {
        const { error, stderr, data } = await asyncReadMtpDir({ ...args });
        if (stderr) {
          log.error(stderr, 'stderr -> fetchDirList -> asyncReadMtpDir');
          dispatch(throwAlert({ message: stderr }));
          return;
        } else if (error) {
          log.error(error, 'error -> fetchDirList -> asyncReadMtpDir');
          dispatch(
            throwAlert({ message: `Unable fetch data from the MTP device.` })
          );
          return;
        }

        dispatch(_fetchDirList(data, deviceType));
      };
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
