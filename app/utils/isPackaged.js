'use strict';

import { IS_PROD } from '../constants/env';

export const isPackaged =
  IS_PROD && process.mainModule.filename.indexOf('app.asar') !== -1;
