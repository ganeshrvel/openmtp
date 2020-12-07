import Analytics from 'electron-ga';
import { machineId } from 'node-machine-id';
import { GA_TRACKING_ID } from '../../../config/google-analytics-key';
import { APP_NAME, APP_VERSION } from '../../constants/meta';
import { settingsStorage } from '../../helpers/storageHelper';
import { ENV_FLAVOR } from '../../constants/env';
import { isConnected } from '../../utils/isOnline';
import { log } from '../../utils/log';
import { getDeviceInfo } from '../../helpers/deviceInfo';
import { isEmpty } from '../../utils/funcs';

class GoogleAnalytics {
  init() {
    this.analytics = null;

    const isAnalyticsEnabledSettings = settingsStorage.getItems([
      'enableAnalytics',
    ]);

    try {
      if (
        isAnalyticsEnabledSettings.enableAnalytics &&
        ENV_FLAVOR.enableAnalytics
      ) {
        isConnected()
          .then(async (connected) => {
            await this.run();

            if (!connected) {
              return;
            }

            return connected;
          })
          .catch(() => {});
      }
    } catch (e) {
      log.error(e, `App -> runAnalytics`);
    }
  }

  async run() {
    // this is a hashed value (sha-256)
    const _machineId = await machineId();

    this.analytics = new Analytics(GA_TRACKING_ID, {
      appName: APP_NAME,
      appVersion: APP_VERSION,
      userId: _machineId,
    });

    this.analytics?.send('screenview', { cd: '/FileExplorer' });
    this.analytics?.send(`pageview`, { dp: '/FileExplorer' });

    this.sendDeviceInfo();
  }

  sendDeviceInfo() {
    if (!this.analytics) {
      this.init();

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
  }
}

export const googleAnalytics = new GoogleAnalytics();
