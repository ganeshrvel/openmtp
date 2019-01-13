'use strict';

import chalk from 'chalk';
import detectPort from 'detect-port';
import { PORT } from '../../config/env';

(function CheckPortInUse() {
  const _port = PORT.toString();

  detectPort(_port, (err, availablePort) => {
    if (_port !== String(availablePort)) {
      throw new Error(
        chalk.whiteBright.bgRed.bold(
          // eslint-disable-next-line prefer-template
          'Port "' +
            _port +
            '" on "localhost" is already in use. Please use another port.'
        )
      );
    } else {
      process.exit(0);
    }
  });
})();
