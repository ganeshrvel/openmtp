import { exec } from 'child_process';
import Promise from 'bluebird';
import { log } from './log';
import { checkIf } from './checkIf';

export const isProcessRunning = (query, cb) => {
  checkIf(query, 'string');
  checkIf(cb, 'function');

  const { platform } = process;
  let cmd = '';

  switch (platform) {
    case 'win32':
      cmd = `tasklist`;
      break;
    case 'darwin':
      cmd = `ps -ax | grep "${query}"`;
      break;
    case 'linux':
      cmd = `ps -A`;
      break;
    default:
      break;
  }

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      log.error(err, 'isProcessRunning -> err');

      return cb(false);
    }

    if (stderr) {
      log.error(stderr, 'isProcessRunning -> stderr');

      return cb(false);
    }

    cb(stdout?.toLowerCase()?.indexOf(query?.toLowerCase()) > -1);
  });
};

export const isGoogleAndroidFileTransferActive = () => {
  return new Promise((resolve) => {
    isProcessRunning('Android File Transfer', (status) => {
      return resolve(status);
    });
  }).catch((e) => {
    log.error(e, 'isGoogleAndroidFileTransferActive -> Promise');
  });
};
