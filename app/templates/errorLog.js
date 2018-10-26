'use strict';

import { APP_NAME, APP_VERSION, AUTHOR_EMAIL } from '../constants';

export const subject = `Error Logs for ${APP_NAME} | Version: ${APP_VERSION}`;
export const body = subject;
export const mailTo = `mailto:${AUTHOR_EMAIL}?subject=${subject}&body=${body}`;
