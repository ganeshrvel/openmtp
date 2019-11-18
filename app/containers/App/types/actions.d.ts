import { ActionType } from 'typesafe-actions';
import * as actions from '../actions';

export type AppActions = ActionType<typeof actions>;
