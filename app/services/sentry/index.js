import * as Sentry from '@sentry/electron';
import { machineId } from 'node-machine-id';
import { ENV_FLAVOR } from '../../constants/env';
import { SERVICE_KEYS } from '../../constants/serviceKeys';
import { getDeviceInfo } from '../../helpers/deviceInfo';
import { isEmpty } from '../../utils/funcs';
import { pkginfo } from '../../utils/pkginfo';

class SentryService {
  constructor() {
    Sentry.init({
      dsn: SERVICE_KEYS.sentryDsn,
      // disabled native crash reporting to respect user's privacy
      enableNative: false,
      release: pkginfo.version,
    });
  }

  async report({ error, title }) {
    if (!ENV_FLAVOR.reportToSenty) {
      return;
    }

    const _machineId = await machineId();

    const deviceInfo = getDeviceInfo();

    Sentry.configureScope((scope) => {
      if (!isEmpty(deviceInfo)) {
        Object.keys(deviceInfo).forEach((a) => {
          const item = deviceInfo[a];

          scope.setExtra(a, item);
        });
      }

      if (!isEmpty(title)) {
        scope.setExtra('error title', title);
      }

      // this is a hashed value (sha-256)
      scope.setUser({ id: _machineId });

      Sentry.captureException(error);
    });
  }
}

export const sentryService = new SentryService();
