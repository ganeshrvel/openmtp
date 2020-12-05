import Analytics from 'electron-ga';
import { machineId } from 'node-machine-id';
import { TRACKING_ID } from '../../../config/google-analytics-key';
import { APP_NAME, APP_VERSION } from '../../constants/meta';
import { settingsStorage } from '../../helpers/storageHelper';
import { ENV_FLAVOR } from '../../constants/env';
import { isConnected } from '../../utils/isOnline';
import { log } from '../../utils/log';

class GoogleAnalytics {
  init() {
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

    const analytics = new Analytics(TRACKING_ID, {
      appName: APP_NAME,
      appVersion: APP_VERSION,
      userId: _machineId,
    });

    analytics.send('screenview', { cd: '/Home' });
    analytics.send(`pageview`, { dp: '/Home' });
  }
}

export const googleAnalytics = new GoogleAnalytics();
