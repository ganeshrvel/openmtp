'use strict';
import prefixer from '../../utils/reducerPrefixer.js';
import { asyncReadDir } from '../../api/sys';
import { log } from '@Log';

const prefix = '@@counter';
const actionTypesList = [
  'REQ_LOAD',
  'RES_LOAD',
  'FAIL_LOAD',
  'SET_SORTING_DIR_LISTS',
  'SET_SELECTED_DIR_LISTS',
  'FETCH_DIR_LIST'
];

export const actionTypes = prefixer(prefix, actionTypesList);

export function setSortingDirLists(data) {
  return {
    type: actionTypes.SET_SORTING_DIR_LISTS,
    payload: {
      ...data
    }
  };
}

export function setSelectedDirLists(data) {
  return {
    type: actionTypes.SET_SELECTED_DIR_LISTS,
    payload: {
      ...data
    }
  };
}

export function fetchDirList({ ...args }) {
  return async dispatch => {
    const { error, data } = await asyncReadDir({ ...args });

    if (error) {
      log.error(error, 'fetchDirList -> asyncReadDir');
      return;
    }

    dispatch({
      type: actionTypes.FETCH_DIR_LIST,
      payload: {
        nodes: data
      }
    });
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
