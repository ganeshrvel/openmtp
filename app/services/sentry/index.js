import { init, configureScope } from '@sentry/electron';
import { ENV_FLAVOR } from '../../constants/env';
import { SERVICE_KEYS } from '../../constants/serviceKeys';

class Sentry {
  constructor() {
    if (!ENV_FLAVOR.reportToSenty) {
      return;
    }

    init({
      dsn: SERVICE_KEYS.sentryDsn,
      enableNative: false,
    });
  }

  init() {
    //const _machineId = await machineId();
    //todo fix
    configureScope((scope) => {
      scope.setExtra('battery', 0.7);
      scope.setTag('user_mode', 'admin');
      scope.setUser({ id: '4711' });
    });
  }
}

export const sentryService = new Sentry();

sentryService.init();
