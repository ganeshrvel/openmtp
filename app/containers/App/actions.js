'use strict';

import prefixer from '../../utils/reducerPrefixer';

const prefix = '@@App';
const actionTypesList = ['REQ_LOAD', 'RES_LOAD', 'FAIL_LOAD'];

export const actionTypes = prefixer(prefix, actionTypesList);

export function reqLoadApp() {
  return {
    type: actionTypes.REQ_LOAD
  };
}
export function resLoadApp() {
  return {
    type: actionTypes.RES_LOAD
  };
}

export function failLoadApp(e) {
  return {
    type: actionTypes.FAIL_LOAD,
    payload: {
      error: e
    }
  };
}
