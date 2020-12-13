import { log } from '../../utils/log';
import { GoogleAnalytics } from './googleAnalytics';
import { settingsStorage } from '../../helpers/storageHelper';

class AnalyticsService {
  constructor() {
    this.googleAnalytics = new GoogleAnalytics();
  }

  _isAnalyticsEnabled = () => {
    const isAnalyticsEnabledSettings = settingsStorage.getItems([
      'enableAnalytics',
    ]);

    return isAnalyticsEnabledSettings.enableAnalytics;
  };

  async init() {
    // if analytics is disabled then dont proceed
    if (!this._isAnalyticsEnabled()) {
      return;
    }

    try {
      // init google analytics
      await this.googleAnalytics.init();
    } catch (e) {
      log.error(e, `AnalyticsService -> init`);
    }
  }

  async sendDeviceInfo() {
    // if analytics is disabled then dont proceed
    if (!this._isAnalyticsEnabled()) {
      return;
    }

    try {
      // send device info google analytics
      await this.googleAnalytics.sendDeviceInfo();
    } catch (e) {
      log.error(e, `AnalyticsService -> sendDeviceInfo`);
    }
  }
}

export const analyticsService = new AnalyticsService();
