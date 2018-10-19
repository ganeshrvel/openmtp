'use strict';

import { IS_DEV } from '../constants/env';
import { PATHS } from './paths';
import { writeFileAsync } from '../api/sys/fileOps';
import { dateTimeUnixTimestampNow } from './date';

const { logFile } = PATHS;

export const log = {
  info(e, title = `Log`, allowInProd = false) {
    if (allowInProd) {
      console.info(`${title} => `, e);
      return;
    }
    IS_DEV && console.info(`${title} => `, e);
  },
  error(e, title = `Log`, allowInProd = false) {
    writeFileAsync({
      filePath: logFile,
      text: `Date Time: ${dateTimeUnixTimestampNow({
        monthInletters: true
      })}\nError title: ${title} \nError body: ${e}\n`
    });
    if (allowInProd) {
      console.error(`${title} => `, e);
      return;
    }
    IS_DEV && console.error(`${title} => `, e);
  }
};
