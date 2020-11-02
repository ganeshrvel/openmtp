import { APP_NAME, APP_WEBSITE } from '../constants/meta';

const inviteViaEmailSubject = `Android File Transfer for macOS - OpenMTP`;

const inviteViaEmailBody = `Tired of using expensive, outdated, bug heavy, Android File Transfer apps for macOS? %0D%0A Download "${APP_NAME}" - The Most Advanced Android File Transfer App for macOS from ${APP_WEBSITE} for free. %0D%0A It's Safe, Transparent, Open-Source and FREE for a lifetime!`;

export const inviteViaEmail = `mailto:?Subject=${inviteViaEmailSubject}&Body=${inviteViaEmailBody}`;
