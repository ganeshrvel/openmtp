import { isObject } from 'nice-utils';
import mixpanel from 'mixpanel-browser';
import { machineId } from 'node-machine-id';
import { log } from '../../utils/log';
import { isEmpty } from '../../utils/funcs';
import { ENV_FLAVOR } from '../../constants/env';
import { EVENTS } from '../../enums/events';
import { SERVICE_KEYS } from '../../constants/serviceKeys';
import { checkIf } from '../../utils/checkIf';

export class MixpanelAnalytics {
  constructor() {
    this.isInitialized = false;
    this.machineId = null;
  }

  _print(key, value) {
    let _value = value;

    if (value && isObject(value)) {
      _value = JSON.stringify(value);
    }

    log.info(
      '════════════════════════════════════════════════════════════════════'
    );
    log.info(
      "Mixpanel analytics log. This wouldn't show up in the production mode"
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

      if (ENV_FLAVOR.enableMixpanelAnalytics) {
        mixpanel.init(SERVICE_KEYS.mixpanelAnalytics);
        mixpanel.identify(this.machineId);
      }

      this._print(EVENTS.INIT, this.machineId);

      this.isInitialized = true;

      return this.isInitialized;
    } catch (e) {
      log.error(e, `MixpanelAnalytics -> _init`);

      return null;
    }
  }

  async sendDeviceInfo({ deviceInfo }) {
    checkIf(deviceInfo, 'object');

    try {
      // reconnect analytics if [analytics] object is null
      if (!this.isInitialized) {
        await this.init();

        if (!this.isInitialized) {
          return;
        }
      }

      if (isEmpty(deviceInfo)) {
        return;
      }

      const eventData = {
        USER_ID: this.machineId,
      };

      Object.keys(deviceInfo).forEach((key) => {
        eventData[key] = deviceInfo[key];
      });

      if (ENV_FLAVOR.enableMixpanelAnalytics) {
        mixpanel.people.set(eventData);
      }

      this._print(EVENTS.DEVICE_INFO, eventData);
    } catch (e) {
      log.error(e, `GoogleAnalytics -> sendDeviceInfo`);
    }
  }
}
