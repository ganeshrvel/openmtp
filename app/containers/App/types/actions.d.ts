import { ActionType } from 'typesafe-actions';
import * as actions from '../actions';

export type AppActions = ActionType<typeof actions>;

export type AppActionTypesList = 'REQ_LOAD' | 'RES_LOAD' | 'FAIL_LOAD';
