'use strict';

import Promise from 'bluebird';
import dns from 'dns';
import { log } from './log';

export const isConnected = () => {
  try {
    return new Promise(resolve => {
      dns.lookup('github.com', err => {
        if (err && err.code === 'ENOTFOUND') {
          resolve(false);
          return null;
        }
        resolve(true);
      });
    });
  } catch (e) {
    log.error(e, `isOnline -> isConnected`);
  }
};
