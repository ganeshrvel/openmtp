'use strict';

const IS_DEV = process.env.NODE_ENV !== 'production';

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
