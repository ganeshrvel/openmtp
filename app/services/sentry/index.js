import * as Sentry from '@sentry/electron';
import { machineId } from 'node-machine-id';
import { ENV_FLAVOR } from '../../constants/env';
import { SERVICE_KEYS } from '../../constants/serviceKeys';
import { getDeviceInfo } from '../../helpers/deviceInfo';

class SentryService {
  constructor() {
    Sentry.init({
      dsn: SERVICE_KEYS.sentryDsn,
      // disabled native crash reporting to respect user's privacy
      enableNative: false,
    });
  }

  async report({ error }) {
    if (!ENV_FLAVOR.reportToSenty) {
      return;
    }

    const _machineId = await machineId();

    const {
      StandardVersion,
      MTPVersion,
      MTPExtension,
      Manufacturer,
      Model,
      DeviceVersion,
    } = getDeviceInfo();

    Sentry.configureScope((scope) => {
      scope.setExtra('Model', Model);
      scope.setExtra('DeviceVersion', DeviceVersion);
      scope.setExtra('Manufacturer', Manufacturer);
      scope.setExtra('MTPExtension', MTPExtension);
      scope.setExtra('MTPVersion', MTPVersion);
      scope.setExtra('StandardVersion', StandardVersion);

      // this is a hashed value (sha-256)
      scope.setUser({ id: _machineId });

      Sentry.captureException(error);
    });
  }
}

export const sentryService = new SentryService();
