'use strict';

import { IS_DEV } from '../constants/env';
import { PATHS } from './paths';
import { appendFileAsync } from '../api/sys/fileOps';
import { dateTimeUnixTimestampNow } from './date';
import { EOL } from 'os';

const { logFile } = PATHS;

export const log = {
  info(e, title = `Log`, logError = false, allowInProd = false) {
    this.doLog(`Info title: ${title}${EOL}Info body: ${e}${EOL}`, logError);

    if (allowInProd) {
      console.info(`${title} => `, e);
      return;
    }
    IS_DEV && console.info(`${title} => `, e);
  },

  error(e, title = `Log`, logError = true, allowInProd = false) {
    this.doLog(`Error title: ${title}${EOL}Error body: ${e}${EOL}`, logError);

    if (allowInProd) {
      console.error(`${title} => `, e);
      return;
    }
    IS_DEV && console.error(`${title} => `, e);
  },

  doLog(text, logError = true) {
    if (logError === false) {
      return null;
    }
    appendFileAsync({
      filePath: logFile,
      text: `Date Time: ${dateTimeUnixTimestampNow({
        monthInletters: true
      })}${EOL}${text}${EOL}`
    });
  }
};
