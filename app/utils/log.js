'use strict';

import { IS_DEV } from '../constants/env';
import { APP_NAME, APP_VERSION } from '../constants';
import { PATHS } from './paths';
import { appendFileAsync } from '../api/sys/fileOps';
import { dateTimeUnixTimestampNow } from './date';
import os, { EOL } from 'os';

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
    let _consoleError = e;
    if (isConsoleError(e)) {
      _consoleError = `Error Stack:${EOL}${JSON.stringify(e.stack)}${EOL}`;
    }

    this.doLog(
      `Error title: ${title}${EOL}Error body: ${EOL}${_consoleError.toString()}${EOL}`,
      logError
    );

    if (allowInProd) {
      console.error(`${title} => `, e);
      return;
    }
    IS_DEV && console.error(`${title} => `, e);
  },

  doLog(e, logError = true, consoleError = null) {
    if (logError === false) {
      return null;
    }

    const sectionSeperator = `=============================================================`;
    let _consoleError = e;
    if (isConsoleError(e)) {
      _consoleError = `Error Stack:${EOL}${JSON.stringify(e.stack)}${EOL}`;
    }

    if (isConsoleError(consoleError)) {
      _consoleError += `Error Stack:${EOL}${JSON.stringify(
        consoleError.stack
      )}${EOL}`;
    }

    appendFileAsync({
      filePath: logFile,
      text: `${sectionSeperator}${EOL}${EOL}App Name: ${APP_NAME}${EOL}App Version: ${APP_VERSION}${EOL}Date Time: ${dateTimeUnixTimestampNow(
        {
          monthInletters: true
        }
      )}${EOL}OS type: ${os.type()} / OS Platform: ${os.platform()} / OS Release: ${os.release()}${EOL}${_consoleError.toString()}${EOL}${_consoleError}${EOL}${sectionSeperator}${EOL}`
    });
  }
};

const isConsoleError = e => {
  return e && e.stack;
};
