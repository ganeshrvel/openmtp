'use strict';
import prefixer from '../../utils/reducerPrefixer.js';

const prefix = '@@Settings';
const actionTypesList = ['TOGGLE_HIDDEN_FILES'];

export const actionTypes = prefixer(prefix, actionTypesList);

export function hideHiddenFiles(data) {
  return {
    type: actionTypes.TOGGLE_HIDDEN_FILES,
    payload:{
      ...data
    }
  };
}
