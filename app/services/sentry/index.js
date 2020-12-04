import { init, configureScope } from '@sentry/electron';
import { ENV_FLAVOR } from '../../constants/env';
import { SERVICE_KEYS } from '../../constants/serviceKeys';

if (ENV_FLAVOR.reportToSenty) {
  init({
    dsn: SERVICE_KEYS.sentryDsn,
    enableNative: false,
  });

  //const _machineId = await machineId();

  configureScope((scope) => {
    scope.setExtra('battery', 0.7);
    scope.setTag('user_mode', 'admin');
    scope.setUser({ id: '4711' });
  });
}
