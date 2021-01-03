import { settingsStorage } from './storageHelper';
import { getAppThemeMode } from './theme';
import { isPrereleaseVersion, undefinedOrNull } from '../utils/funcs';
import { initialState } from '../containers/Settings/reducers';
import { checkIf } from '../utils/checkIf';
import { FILE_TRANSFER_DIRECTION } from '../enums';

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

export const getFilesPreprocessingBeforeTransferSetting = ({ direction }) => {
  checkIf(direction, 'string');
  checkIf(direction, 'inObjectValues', FILE_TRANSFER_DIRECTION);

  const setting = settingsStorage.getItems([
    'filesPreprocessingBeforeTransfer',
  ]);

  let value = setting.filesPreprocessingBeforeTransfer
    ? setting.filesPreprocessingBeforeTransfer[direction]
    : null;

  if (undefinedOrNull(value)) {
    value = initialState.filesPreprocessingBeforeTransfer[direction];
  }

  checkIf(value, 'boolean');

  return value;
};

export const getEnablePrereleaseUpdatesSetting = () => {
  const setting = settingsStorage.getItems(['enablePrereleaseUpdates']);

  let value = setting.enablePrereleaseUpdates;

  const isPrerelease = isPrereleaseVersion();

  if (isPrerelease) {
    return true;
  }

  if (undefinedOrNull(value)) {
    value = initialState.enablePrereleaseUpdates;
  }

  return value;
};
