import { isObject } from 'nice-utils';
import { log } from '../../utils/log';

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

    log.printBoundary();
    log.info(
      "Google analytics log. This wouldn't show up in the production mode"
    );
    log.info(_value.toString(), `${key}`);
    log.printBoundary();
  }

  async init() {
    // todo Fix this error: `TypeError: Cannot read properties of undefined (reading 'app')`
    // try {
    //   // this is a hashed value (sha-256)
    //   this.machineId = await machineId();
    //
    //   // todo `TypeError: Cannot read properties of undefined (reading 'app')`
    //   // this could cause google analytics failure
    //   console.log(
    //     `todo fix TypeError: Cannot read properties of undefined (reading 'app')`
    //   );
    //
    //   this.analytics = new Analytics(SERVICE_KEYS.googleAnalytics, {
    //     appName: APP_NAME,
    //     appVersion: APP_VERSION,
    //     userId: this.machineId,
    //   });
    //   return;
    //
    //   const hashName = getCurrentWindowHash();
    //   let pageName = '/home';
    //
    //   if (hashName !== '/') {
    //     pageName = hashName;
    //   }
    //
    //   if (ENV_FLAVOR.enableGoogleAnalytics) {
    //     this.analytics?.send('screenview', { cd: pageName });
    //     this.analytics?.send(`pageview`, { dp: pageName });
    //   }
    //
    //   this._print('screenview', pageName);
    //   this._print('pageview', pageName);
    //
    //   return this.analytics;
    // } catch (e) {
    //   log.error(e, `GoogleAnalytics -> _init`);
    //
    //   return null;
    // }
  }

  // todo Fix this error: `TypeError: Cannot read properties of undefined (reading 'app')`
  // eslint-disable-next-line no-unused-vars
  async sendDeviceInfo({ deviceInfo, mtpMode }) {
    // checkIf(deviceInfo, 'object');
    // checkIf(mtpMode, 'inObjectValues', MTP_MODE);
    //
    // try {
    //   // reconnect analytics if [analytics] object is null
    //   if (!this.analytics) {
    //     await this.init();
    //
    //     if (!this.analytics) {
    //       return;
    //     }
    //   }
    //
    //   if (!isEmpty(deviceInfo)) {
    //     Object.keys(deviceInfo).forEach((key) => {
    //       const value = deviceInfo[key];
    //
    //       const eventData = {
    //         ec: EVENT_TYPE.DEVICE_INFO,
    //         ea: 'fetch',
    //         el: key,
    //         ev: value,
    //       };
    //
    //       if (ENV_FLAVOR.enableGoogleAnalytics) {
    //         this.analytics.send('event', eventData);
    //       }
    //
    //       this._print(EVENT_TYPE.DEVICE_INFO, eventData);
    //     });
    //   }
    //
    //   if (!isEmpty(mtpMode)) {
    //     const eventData = {
    //       ec: EVENT_TYPE.DEVICE_INFO,
    //       ea: 'fetch',
    //       el: 'MTP Mode',
    //       ev: mtpMode,
    //     };
    //
    //     if (ENV_FLAVOR.enableGoogleAnalytics) {
    //       this.analytics.send('event', eventData);
    //     }
    //
    //     this._print(EVENT_TYPE.DEVICE_INFO, eventData);
    //   }
    // } catch (e) {
    //   log.error(e, `GoogleAnalytics -> sendDeviceInfo`);
    // }
  }
}
