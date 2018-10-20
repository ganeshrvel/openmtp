'use strict';

import { IS_DEV } from '../constants/env';
import { PATHS } from './paths';
import { appendFileAsync } from '../api/sys/fileOps';
import { dateTimeUnixTimestampNow } from './date';
import { EOL } from 'os';

const { logFile } = PATHS;

export const log = {
  info(e, title = `Log`, dontLog = true, allowInProd = false) {
    this.doLog(`Info title: ${title}${EOL}Info body: ${e}${EOL}`, dontLog);

    if (allowInProd) {
      console.info(`${title} => `, e);
      return;
    }
    IS_DEV && console.info(`${title} => `, e);
  },

  error(e, title = `Log`, dontLog = false, allowInProd = false) {
    this.doLog(`Error title: ${title}${EOL}Error body: ${e}${EOL}`, dontLog);

    if (allowInProd) {
      console.error(`${title} => `, e);
      return;
    }
    IS_DEV && console.error(`${title} => `, e);
  },

  doLog(text, dontLog = false) {
    if (dontLog) {
      return;
    }
    appendFileAsync({
      filePath: logFile,
      text: `Date Time: ${dateTimeUnixTimestampNow({
        monthInletters: true
      })}${EOL}${text}${EOL}`
    });
  }
};
