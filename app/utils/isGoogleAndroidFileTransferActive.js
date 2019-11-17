import psList from 'ps-list';
import findLodash from 'lodash/find';
import Promise from 'bluebird';
import { log } from './log';

export const isGoogleAndroidFileTransferActive = () => {
  return new Promise(resolve => {
    psList()
      .then(list => {
        if (
          findLodash(list, { name: 'Android File Transfer' }) &&
          findLodash(list, { name: 'Android File Transfer Agent' })
        ) {
          return resolve(true);
        }

        return resolve(false);
      })
      .catch(e => {
        log.error(e, 'isGoogleAndroidFileTransferActive');
      });
  }).catch(e => {
    log.error(e, 'isGoogleAndroidFileTransferActive -> Promise');
  });
};
