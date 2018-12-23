'use strict';

import Analytics from 'electron-ga';
import { TRACKING_ID } from '../../config/google-analytics-key';
import { APP_NAME, APP_VERSION } from '../constants/meta';

export const analytics = new Analytics(TRACKING_ID, {
  appName: APP_NAME,
  appVersion: APP_VERSION
});
