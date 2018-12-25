'use strict';

import { APP_NAME } from '../constants/meta';
import { APP_GITHUB_RELEASES_URL } from '../constants';

const subject = `Android File Transfer for macOS - OpenMTP`;

const body = `Looking for a good "Android File Transfer" app for macOS? Download "${APP_NAME}", The most advanced Android MTP File Transfer app for macOS from ${APP_GITHUB_RELEASES_URL} for free. It's Safe, OpenSourced and shall always stay Free!`;

export const mailTo = `mailto:?Subject=${subject}&Body=${body}.`;
