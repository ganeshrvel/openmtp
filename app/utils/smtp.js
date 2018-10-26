'use strict';

import { readFileSync } from '../api/sys/fileOps';
import { PATHS } from './paths';
import * as path from 'path';

let certPath = `certs/smtp.private.pem`;
certPath = path.resolve(path.join(PATHS.app, `./${certPath}`));

/*
export const sendmail = _sendmail({
  logger: {
    error: console.error
  },
  silent: true,
  dkim: {
    privateKey: readFileSync({
      filePath: certPath
    }),
    keySelector: 'smtpKey'
  }
  //devPort: 1025, // Default: False
  // devHost: 'localhost', // Default: localhost
  //smtpPort: 2525, // Default: 25
  // smtpHost: 'localhost' // Default: -1 - extra smtp host after resolveMX
});
*/
