import { settingsStorage } from '../utils/storageHelper';
import { getAppThemeMode } from '../utils/theme';
import { undefinedOrNull } from '../utils/funcs';
import { initialState } from '../containers/Settings/reducers';

export const getAppThemeModeSettings = () => {
  const setting = settingsStorage.getItems(['appThemeMode']);

  let value = setting.appThemeMode;

  if (undefinedOrNull(value)) {
    value = initialState.appThemeMode;
  }

  return getAppThemeMode(value);
};

export const getMtpModeSettings = () => {
  const setting = settingsStorage.getItems(['mtpMode']);

  let value = setting.mtpMode;

  if (undefinedOrNull(value)) {
    value = initialState.mtpMode;
  }

  return value;
};
