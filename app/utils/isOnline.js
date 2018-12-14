'use strict';
import Promise from 'bluebird';
import { log } from '../utils/log';

export const isConnected = () => {
  try {
    return new Promise((resolve, reject) => {
      require('dns').lookup('github.com', function(err) {
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
