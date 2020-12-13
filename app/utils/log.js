import os, { EOL } from 'os';
import { IS_PROD } from '../constants/env';
import { APP_NAME, APP_VERSION } from '../constants/meta';
import { PATHS } from '../constants/paths';
import { appendFileAsync } from '../helpers/fileOps';
import { dateTimeUnixTimestampNow } from './date';
import { sentryService } from '../services/sentry';
import { getDeviceInfo } from '../helpers/deviceInfo';
import { isEmpty } from './funcs';

const { logFile } = PATHS;

export const log = {
  info(
    e,
    title = `Log`,
    logError = false,
    allowInProd = false,
    report = false
  ) {
    this.doLog(e, title, null, logError, report, false);

    if (IS_PROD && !allowInProd) {
      return;
    }

    console.info(`${title} => `, e);
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
    this.doLog(e, title, null, logError, report, true);

    if (IS_PROD && !allowInProd) {
      return;
    }

    console.error(`${title} => `, e);
  },

  /**
   *
   * @param {any} e - error
   * @param {boolean} logError - should log the error to the log file
   * @param {string|null}  customError
   * @param {any} report - should report the error to crashanalytics services
   * @param {string|null} title
   * @param {boolean} isError - is an error or info
   */
  doLog(
    e,
    title = null,
    customError = null,
    logError = true,
    report = true,
    isError = true
  ) {
    if (logError === false) {
      return null;
    }

    const sectionSeperator = `=============================================================`;

    const logType = isError ? `Error` : `Info`;
    let err = `${logType} title: ${title}${EOL}${logType} body: ${EOL}${e?.toString()}${EOL}`;

    // if [e] is an Instance of Error then stringify it
    if (isConsoleError(e)) {
      err += `${logType} Stacktrace: ${EOL}${JSON.stringify(e.stack)}${EOL}`;
    }

    if (!isEmpty(customError)) {
      err += `Custom ${logType}: ${customError?.toString()}${EOL}`;
    }

    let _deviceInfoStrigified = '';
    const deviceInfo = getDeviceInfo();

    if (!isEmpty(deviceInfo)) {
      Object.keys(deviceInfo).forEach((a) => {
        const item = deviceInfo[a];

        _deviceInfoStrigified += `${a}: ${item}${EOL}`;
      });
    }

    const _date = `Date Time: ${dateTimeUnixTimestampNow({
      monthInletters: true,
    })}`;
    const _appInfo = `${EOL}App Name: ${APP_NAME}${EOL}App Version: ${APP_VERSION}`;
    const _osInfo = `OS type: ${os.type()} / OS Platform: ${os.platform()} / OS Release: ${os.release()}`;
    const _error = `${sectionSeperator}${EOL}${_appInfo}${EOL}${_date}${EOL}${_osInfo}${EOL}${_deviceInfoStrigified}${logType}: ${err}${EOL}${sectionSeperator}${EOL}`;

    appendFileAsync(logFile, _error);

    if (report) {
      let errorToReport = e;

      if (e && !isConsoleError(e)) {
        errorToReport = new Error(e);
      }

      sentryService.report({ error: errorToReport, title });
    }
  },
};

const isConsoleError = (e) => {
  return e && e.stack;
};
