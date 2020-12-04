import os, { EOL } from 'os';
import { IS_DEV } from '../constants/env';
import { APP_NAME, APP_VERSION } from '../constants/meta';
import { PATHS } from '../constants/paths';
import { appendFileAsync } from '../helpers/fileOps';
import { dateTimeUnixTimestampNow } from './date';
import { sentryService } from '../services/sentry';
import { getDeviceInfo } from '../helpers/deviceInfo';

const { logFile } = PATHS;

export const log = {
  info(e, title = `Log`, logError = false, allowInProd = false) {
    this.doLog(`Info title: ${title}${EOL}Info body: ${e}${EOL}`, logError);

    if (allowInProd) {
      console.info(`${title} => `, e);

      return;
    }

    if (IS_DEV) {
      console.info(`${title} => `, e);
    }
  },

  /**
   *
   * @param e - error
   * @param title - Title
   * @param logError - should log the error to the log file
   * @param allowInProd - display the error in production
   * @param report - should report the error to crashanalytics services
   */
  error(e, title = `Log`, logError = true, allowInProd = false, report = true) {
    let _consoleError = e;

    if (isConsoleError(e)) {
      _consoleError = `Error Stack:${EOL}${JSON.stringify(e.stack)}${EOL}`;
    }

    this.doLog(
      `Error title: ${title}${EOL}Error body: ${EOL}${_consoleError.toString()}${EOL}`,
      logError,
      report
    );

    if (allowInProd) {
      console.error(`${title} => `, e);

      return;
    }

    if (IS_DEV) {
      console.error(`${title} => `, e);
    }
  },

  /**
   *
   * @param e - error
   * @param logError - should log the error to the log file
   * @param consoleError - console error to extract the stacktrace out of it
   * @param report - should report the error to crashanalytics services
   */
  doLog(e, logError = true, consoleError = null, report = true) {
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

    let _deviceInfoStrigified = '';
    const deviceInfo = getDeviceInfo();

    Object.keys(getDeviceInfo()).forEach((a) => {
      const item = deviceInfo[a];

      _deviceInfoStrigified += `${a}: ${item}${EOL}`;
    });

    const _date = `Date Time: ${dateTimeUnixTimestampNow({
      monthInletters: true,
    })}`;

    const _appInfo = `${EOL}App Name: ${APP_NAME}${EOL}App Version: ${APP_VERSION}`;
    const _osInfo = `OS type: ${os.type()} / OS Platform: ${os.platform()} / OS Release: ${os.release()}`;

    const _error = `${sectionSeperator}${EOL}${_appInfo}${EOL}${_date}${EOL}${_osInfo}${EOL}${_deviceInfoStrigified}Error stringified: ${_consoleError.toString()}${EOL}Error: ${_consoleError}${EOL}${sectionSeperator}${EOL}`;

    appendFileAsync(logFile, _error);

    if (report) {
      let _err = e;

      if (e && !isConsoleError(e)) {
        _err = new Error(e);
      }

      sentryService.report({ error: _err });
    }
  },
};

const isConsoleError = (e) => {
  return e && e.stack;
};
