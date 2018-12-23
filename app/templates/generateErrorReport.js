'use strict';

import { APP_NAME, APP_VERSION, AUTHOR_EMAIL } from '../constants/meta';

const subject = `Error Logs for ${APP_NAME} | Version: ${APP_VERSION}`;
const body = subject;

export const mailTo = `mailto:${AUTHOR_EMAIL}?Subject=${subject}&Body=${body}.`;

export const mailToInstructions = zippedLogFileBaseName =>
  `%0D%0A %0D%0A Attach the generated error report file "${zippedLogFileBaseName}" (which is found in your Desktop folder) along with this email.`;

export const reportGenerateError = `Error report generation failed. Try again!`;
