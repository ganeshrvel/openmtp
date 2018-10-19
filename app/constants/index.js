'use strict';

import { PATHS } from '../utils/paths';

export const deviceTypeConst = { mtp: 'mtp', local: 'local' };

export const devicesDefaultPaths = {
  [deviceTypeConst.mtp]: '/',
  [deviceTypeConst.local]: PATHS.homeDir
};
