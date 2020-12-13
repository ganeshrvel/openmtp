import Analytics from 'electron-ga';
import { isObject } from 'nice-utils';
import { machineId } from 'node-machine-id';
import { GA_TRACKING_ID } from '../../../config/google-analytics-key';
import { APP_NAME, APP_VERSION } from '../../constants/meta';
import { log } from '../../utils/log';
import { getDeviceInfo } from '../../helpers/deviceInfo';
import { isEmpty } from '../../utils/funcs';
import { ENV_FLAVOR } from '../../constants/env';
import { EVENTS } from '../../enums/events';

export class GoogleAnalytics {
  constructor() {
    this.analytics = null;
    this.machineId = null;
  }

  _print(key, value) {
    let _value = value;

    if (isObject(value)) {
      _value = JSON.stringify(value);
    }

    log.info(
      '════════════════════════════════════════════════════════════════════'
    );
    log.info(
      "Google analytics log. This wouldn't show up in the production mode"
    );
    log.info(_value.toString(), `'${key}'`);
    log.info(
      '════════════════════════════════════════════════════════════════════'
    );
  }

  async init() {
    try {
      // this is a hashed value (sha-256)
      this.machineId = await machineId();

      this.analytics = new Analytics(GA_TRACKING_ID, {
        appName: APP_NAME,
        appVersion: APP_VERSION,
        userId: this.machineId,
      });

      if (ENV_FLAVOR.enableGoogleAnalytics) {
        this.analytics?.send('screenview', { cd: '/FileExplorer' });
        this.analytics?.send(`pageview`, { dp: '/FileExplorer' });
      }

      this._print('screenview', '/FileExplorer');
      this._print('pageview', '/FileExplorer');

      return this.analytics;
    } catch (e) {
      log.error(e, `GoogleAnalytics -> _init`);

      return null;
    }
  }

  async sendDeviceInfo() {
    try {
      // reconnect analytics if [analytics] object is null
      if (!this.analytics) {
        await this.init();

        if (!this.analytics) {
          return;
        }
      }

      const deviceInfo = getDeviceInfo();

      if (!isEmpty(deviceInfo)) {
        Object.keys(deviceInfo).forEach((key) => {
          const value = deviceInfo[key];

          const eventData = {
            ec: 'Device Information',
            ea: 'fetch',
            el: key,
            ev: value,
          };

          if (ENV_FLAVOR.enableGoogleAnalytics) {
            this.analytics.send('event', eventData);
          }

          this._print(EVENTS.DEVICE_INFO, eventData);
        });
      }
    } catch (e) {
      log.error(e, `GoogleAnalytics -> sendDeviceInfo`);
    }
  }
}
