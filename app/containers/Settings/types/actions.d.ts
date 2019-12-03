import { DevicesTypeEnum } from '../../../constants/index.td';
import { actionTypes } from '../actions';
import { FileExplorerListingTypes, SettingsReducersState } from './reducers';

export type SettingsActionTypes = typeof actionTypes;

export type SettingsActions =
  | {
      type: typeof SettingsActionTypes.FRESH_INSTALL;
      payload: Pick<SettingsReducersState, 'freshInstall'>;
      deviceType: null;
    }
  | {
      type: typeof SettingsActionTypes.SET_ONBOARDING;
      payload: Pick<SettingsReducersState, 'onboarding'>;
      deviceType: null;
    }
  | {
      type: typeof SettingsActionTypes.TOGGLE_SETTINGS;
      payload: Pick<SettingsReducersState, 'toggleSettings'>;
      deviceType: null;
    }
  | {
      type: typeof SettingsActionTypes.HIDE_HIDDEN_FILES;
      payload: boolean;
      deviceType: DevicesTypeEnum;
    }
  | {
      type: typeof SettingsActionTypes.FILE_EXPLORER_LISTING_TYPE;
      payload: FileExplorerListingTypes;
      deviceType: DevicesTypeEnum;
    }
  | {
      type:
        | typeof SettingsActionTypes.ENABLE_AUTO_UPDATE_CHECK
        | typeof SettingsActionTypes.ENABLE_BACKGROUND_AUTO_UPDATE
        | typeof SettingsActionTypes.ENABLE_PRERELEASE_UPDATES
        | typeof SettingsActionTypes.ENABLE_ANALYTICS
        | typeof SettingsActionTypes.ENABLE_STATUS_BAR;
      payload: boolean;
      deviceType: null;
    };

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
