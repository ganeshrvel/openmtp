import { ActionType } from 'typesafe-actions';
import * as actions from '../actions';

export type SettingsActions = ActionType<typeof actions>;

export type SettingsActionTypesList =
  | 'TOGGLE_SETTINGS'
  | 'FRESH_INSTALL'
  | 'SET_ONBOARDING'
  | 'HIDE_HIDDEN_FILES'
  | 'FILE_EXPLORER_LISTING_TYPE'
  | 'ENABLE_AUTO_UPDATE_CHECK'
  | 'ENABLE_BACKGROUND_AUTO_UPDATE'
  | 'ENABLE_PRERELEASE_UPDATES'
  | 'ENABLE_ANALYTICS'
  | 'ENABLE_STATUS_BAR'
  | 'COPY_JSON_FILE_TO_SETTINGS';
