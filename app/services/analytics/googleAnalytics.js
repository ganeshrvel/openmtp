import Analytics from 'electron-ga';
import { machineId } from 'node-machine-id';
import { GA_TRACKING_ID } from '../../../config/google-analytics-key';
import { APP_NAME, APP_VERSION } from '../../constants/meta';
import { settingsStorage } from '../../helpers/storageHelper';
import { ENV_FLAVOR } from '../../constants/env';
import { log } from '../../utils/log';
import { getDeviceInfo } from '../../helpers/deviceInfo';
import { isEmpty } from '../../utils/funcs';

class GoogleAnalytics {
  _isAnalyticsEnabled = () => {
    const isAnalyticsEnabledSettings = settingsStorage.getItems([
      'enableAnalytics',
    ]);

    return (
      isAnalyticsEnabledSettings.enableAnalytics && ENV_FLAVOR.enableAnalytics
    );
  };

  async init() {
    this.analytics = null;

    if (!this._isAnalyticsEnabled()) {
      return;
    }

    try {
      await this._init();
    } catch (e) {
      log.error(e, `GoogleAnalytics -> init`);
    }
  }

  async _init() {
    try {
      // this is a hashed value (sha-256)
      const _machineId = await machineId();

      this.analytics = new Analytics(GA_TRACKING_ID, {
        appName: APP_NAME,
        appVersion: APP_VERSION,
        userId: _machineId,
      });

      this.analytics?.send('screenview', { cd: '/FileExplorer' });
      this.analytics?.send(`pageview`, { dp: '/FileExplorer' });

      await this.sendDeviceInfo();
    } catch (e) {
      log.error(e, `GoogleAnalytics -> _init`);
    }
  }

  async sendDeviceInfo() {
    try {
      if (!this._isAnalyticsEnabled()) {
        return;
      }

      if (!this.analytics) {
        await this.init();

        return;
      }

      const deviceInfo = getDeviceInfo();

      if (!isEmpty(deviceInfo)) {
        Object.keys(deviceInfo).forEach((key) => {
          const value = deviceInfo[key];

          this.analytics.send('event', {
            ec: 'Device Information',
            ea: 'fetch',
            el: key,
            ev: value,
          });
        });
      }
    } catch (e) {
      log.error(e, `GoogleAnalytics -> sendDeviceInfo`);
    }
  }
}

export const googleAnalytics = new GoogleAnalytics();
