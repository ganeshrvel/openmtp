import * as Sentry from '@sentry/electron';
import { ENV_FLAVOR } from '../../constants/env';
import { SERVICE_KEYS } from '../../constants/serviceKeys';
import { getDeviceInfo } from '../../helpers/deviceInfo';
import { isEmpty } from '../../utils/funcs';
import { pkginfo } from '../../utils/pkginfo';
import { checkIf } from '../../utils/checkIf';
import { MTP_MODE } from '../../enums';
import { getMachineId } from '../../helpers/identifiers';

class SentryService {
  constructor() {
    if (!ENV_FLAVOR.reportToSenty) {
      return;
    }

    this.init();
  }

  async init() {
    Sentry.init({
      dsn: SERVICE_KEYS.sentryDsn,
      // disabled native crash reporting to respect user's privacy
      enableNative: false,
      release: pkginfo.version,
    });

    this.machineId = getMachineId();
  }

  async report({ error, title, mtpMode }) {
    checkIf(mtpMode, 'inObjectValues', MTP_MODE);

    if (!ENV_FLAVOR.reportToSenty) {
      return;
    }

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

      scope.setExtra('MTP Mode', mtpMode);

      // this is a hashed value (sha-256)
      scope.setUser({ id: this.machineId });

      Sentry.captureException(error);
    });
  }
}

export const sentryService = new SentryService();
