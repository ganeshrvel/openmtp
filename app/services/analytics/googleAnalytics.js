import Analytics from 'electron-ga';
import { isObject } from 'nice-utils';
import { machineId } from 'node-machine-id';
import { APP_NAME, APP_VERSION } from '../../constants/meta';
import { log } from '../../utils/log';
import { isEmpty } from '../../utils/funcs';
import { ENV_FLAVOR } from '../../constants/env';
import { EVENTS } from '../../enums/events';
import { SERVICE_KEYS } from '../../constants/serviceKeys';
import { checkIf } from '../../utils/checkIf';

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

      this.analytics = new Analytics(SERVICE_KEYS.googleAnalytics, {
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

  async sendDeviceInfo({ deviceInfo }) {
    checkIf(deviceInfo, 'object');

    try {
      // reconnect analytics if [analytics] object is null
      if (!this.analytics) {
        await this.init();

        if (!this.analytics) {
          return;
        }
      }

      if (isEmpty(deviceInfo)) {
        return;
      }

      Object.keys(deviceInfo).forEach((key) => {
        const value = deviceInfo[key];

        const eventData = {
          ec: EVENTS.DEVICE_INFO,
          ea: 'fetch',
          el: key,
          ev: value,
        };

        if (ENV_FLAVOR.enableGoogleAnalytics) {
          this.analytics.send('event', eventData);
        }

        this._print(EVENTS.DEVICE_INFO, eventData);
      });
    } catch (e) {
      log.error(e, `GoogleAnalytics -> sendDeviceInfo`);
    }
  }
}
