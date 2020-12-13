import { log } from '../../utils/log';
import { GoogleAnalytics } from './googleAnalytics';
import { settingsStorage } from '../../helpers/storageHelper';
import { MixpanelAnalytics } from './mixpanelAnalytics';
import { getDeviceInfo } from '../../helpers/deviceInfo';

class AnalyticsService {
  constructor() {
    this.googleAnalytics = new GoogleAnalytics();
    this.mixpanelAnalytics = new MixpanelAnalytics();
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
      await this.mixpanelAnalytics.init();
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
      const deviceInfo = getDeviceInfo();

      // send device info google analytics
      await this.googleAnalytics.sendDeviceInfo({ deviceInfo });
      await this.mixpanelAnalytics.sendDeviceInfo({ deviceInfo });
    } catch (e) {
      log.error(e, `AnalyticsService -> sendDeviceInfo`);
    }
  }
}

export const analyticsService = new AnalyticsService();
