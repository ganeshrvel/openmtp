import { DevicesTypeEnum } from '../../../constants';

export interface SettingsReducersState {
  freshInstall: undefined | null | -1 | 0 | 1;
  onboarding: {
    lastFiredVersion: null | string;
  };
  toggleSettings: boolean;
  enableAutoUpdateCheck: boolean;
  enableBackgroundAutoUpdate: boolean;
  enablePrereleaseUpdates: boolean;
  enableAnalytics: boolean;
  enableStatusBar: boolean;
  hideHiddenFiles: {
    [DevicesTypeEnum.local]: boolean;
    [DevicesTypeEnum.mtp]: boolean;
  };
  fileExplorerListingType: {
    [DevicesTypeEnum.local]: 'grid' | 'list';
    [DevicesTypeEnum.mtp]: 'grid' | 'list';
  };
}

export type CopyJsonFileToSettings = Exclude<
  Partial<SettingsReducersState>,
  'freshInstall'
>;
