import { settingsStorage } from './storageHelper';
import { getAppThemeMode } from './theme';
import { undefinedOrNull } from '../utils/funcs';
import { initialState } from '../containers/Settings/reducers';

export const getAppThemeModeSetting = () => {
  const setting = settingsStorage.getItems(['appThemeMode']);

  let value = setting.appThemeMode;

  if (undefinedOrNull(value)) {
    value = initialState.appThemeMode;
  }

  return getAppThemeMode(value);
};

export const getMtpModeSetting = () => {
  const setting = settingsStorage.getItems(['mtpMode']);

  let value = setting.mtpMode;

  if (undefinedOrNull(value)) {
    value = initialState.mtpMode;
  }

  return value;
};

export const getEnableFilesPreprocessingBeforeTransferSetting = () => {
  const setting = settingsStorage.getItems([
    'enableFilesPreprocessingBeforeTransfer',
  ]);

  let value = setting.mtpMode;

  if (undefinedOrNull(value)) {
    value = initialState.enableFilesPreprocessingBeforeTransfer;
  }

  return value;
};
