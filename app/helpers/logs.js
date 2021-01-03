import { PATHS } from '../constants/paths';
import { undefinedOrNull } from '../utils/funcs';

/**
 * Description - Strip user home directory path from the error before it is sent to sentry
 * @param s
 * @return {string|string}
 */
export const redactHomeDirectory = (s) => {
  if (undefinedOrNull(s)) {
    return '';
  }

  return (
    s?.toString()?.replaceAll(new RegExp(PATHS.homeDir, 'ig'), '/Users/user') ??
    ''
  );
};
