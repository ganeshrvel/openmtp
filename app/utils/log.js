'use strict';

import { IS_DEV } from '../constants/env';

export const log = {
  info(e, title = `Log`, allowInProd = false) {
    if (allowInProd) {
      console.info(`${title} => `, e);
      return;
    }
    IS_DEV && console.info(`${title} => `, e);
  },
  error(e, title = `Log`, allowInProd = false) {
    if (allowInProd) {
      console.error(`${title} => `, e);
      return;
    }
    IS_DEV && console.error(`${title} => `, e);
  }
};
