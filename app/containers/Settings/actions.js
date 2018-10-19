'use strict';
import prefixer from '../../utils/reducerPrefixer.js';

const prefix = '@@Settings';
const actionTypesList = ['HIDE_HIDDEN_FILES'];

export const actionTypes = prefixer(prefix, actionTypesList);

export function hideHiddenFiles(data) {
  return {
    type: actionTypes.HIDE_HIDDEN_FILES,
    payload:{
      ...data
    }
  };
}
