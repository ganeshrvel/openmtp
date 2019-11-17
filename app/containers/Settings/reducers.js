import { actionTypes } from './actions';
import { DEVICES_TYPE_CONST } from '../../constants';

export const initialState = {
  freshInstall: 0,
  onboarding: {
    lastFiredVersion: null
  },
  toggleSettings: false,
  enableAutoUpdateCheck: true,
  enableBackgroundAutoUpdate: true,
  enablePrereleaseUpdates: false,
  enableAnalytics: true,
  enableStatusBar: true,
  hideHiddenFiles: {
    [DEVICES_TYPE_CONST.local]: true,
    [DEVICES_TYPE_CONST.mtp]: true
  },

  fileExplorerListingType: {
    [DEVICES_TYPE_CONST.local]: 'grid',
    [DEVICES_TYPE_CONST.mtp]: 'grid'
  }
};

export default function Settings(state = initialState, action) {
  const { type, payload, deviceType = null } = action;
  switch (type) {
    case actionTypes.FRESH_INSTALL:
      return { ...state, freshInstall: payload };

    case actionTypes.SET_ONBOARDING:
      return {
        ...state,
        onboarding: {
          ...state.onboarding,
          ...payload
        }
      };

    case actionTypes.TOGGLE_SETTINGS:
      return { ...state, toggleSettings: payload };

    case actionTypes.HIDE_HIDDEN_FILES:
      return {
        ...state,
        hideHiddenFiles: { ...state.hideHiddenFiles, [deviceType]: payload }
      };

    case actionTypes.FILE_EXPLORER_LISTING_TYPE:
      return {
        ...state,
        fileExplorerListingType: {
          ...state.fileExplorerListingType,
          [deviceType]: payload
        }
      };

    case actionTypes.ENABLE_AUTO_UPDATE_CHECK:
      return { ...state, enableAutoUpdateCheck: payload };

    case actionTypes.ENABLE_BACKGROUND_AUTO_UPDATE:
      return { ...state, enableBackgroundAutoUpdate: payload };

    case actionTypes.ENABLE_PRERELEASE_UPDATES:
      return { ...state, enablePrereleaseUpdates: payload };

    case actionTypes.ENABLE_ANALYTICS:
      return { ...state, enableAnalytics: payload };

    case actionTypes.ENABLE_STATUS_BAR:
      return { ...state, enableStatusBar: payload };

    case actionTypes.COPY_JSON_FILE_TO_SETTINGS:
      return { ...state, ...payload };

    default:
      return state;
  }
}
