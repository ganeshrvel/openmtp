'use strict';

import prefixer from '../../utils/reducerPrefixer';

const prefix = '@@Alerts';
const actionTypesList = ['THROW_ALERT', 'CLEAR_ALERT'];

export const actionTypes = prefixer(prefix, actionTypesList);

export function throwAlert(data) {
  return {
    type: actionTypes.THROW_ALERT,
    payload: {
      ...data
    }
  };
}
export function clearAlert() {
  return {
    type: actionTypes.CLEAR_ALERT
  };
}
