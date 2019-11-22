import { action } from 'typesafe-actions';
import prefixer from '../../utils/reducerPrefixer';
import { AppActionTypesList } from './types/actions';

const prefix = '@@App';
const actionTypesList: AppActionTypesList[] = [
  'REQ_LOAD',
  'RES_LOAD',
  'FAIL_LOAD'
];

export const actionTypes = prefixer<AppActionTypesList>(
  prefix,
  actionTypesList
);

export const reqLoadApp = () => action(actionTypes.REQ_LOAD);

export const resLoadApp = () => action(actionTypes.RES_LOAD);

export const failLoadApp = (e: object) =>
  action(actionTypes.FAIL_LOAD, {
    error: e
  });
