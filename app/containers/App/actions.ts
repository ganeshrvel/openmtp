import { action } from 'typesafe-actions';
import prefixer from '../../utils/reducerPrefixer';

const prefix = '@@App';
const actionTypesList = ['REQ_LOAD', 'RES_LOAD', 'FAIL_LOAD'];

export const actionTypes = prefixer(prefix, actionTypesList);

export const reqLoadApp = () => action(actionTypes.REQ_LOAD);

export const resLoadApp = () => action(actionTypes.RES_LOAD);

export const failLoadApp = (e: object) =>
  action(actionTypes.FAIL_LOAD, {
    error: e
  });
