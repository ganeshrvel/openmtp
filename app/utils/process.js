import { spawn } from 'child_process';
import { checkIf } from './checkIf';
import { log } from './log';

// this is to prevent grep from appearing in the pslist and thus polluting the output
const queryToRegex = (str) => {
  if (typeof str === 'undefined' || str === null) {
    return '';
  }

  if (str.trim() === '') {
    return '';
  }

  str.replace(str.charAt(0), `[${str.charAt(0)}]`);
};

export const isProcessRunning = (query) => {
  checkIf(checkIf, 'string');

  return new Promise((resolve) => {
    let stdout = '';
    let stderr;

    const child = spawn('ps', ['aux']);
    const grep = spawn('grep', [`"${queryToRegex(query)}"`]);

    child.stdout.pipe(grep.stdin);

    child.stdout.on('data', (data) => {
      stdout += data;
    });

    child.stderr.on('data', (data) => {
      stderr = data;
    });

    child.on('exit', (code) => {
      if (code > 1 && stderr) {
        log.error(stderr, 'isProcessRunning -> exit');

        return resolve(false);
      }

      return resolve(
        (stdout ?? '')?.toLowerCase().indexOf(query?.toLowerCase()) > -1
      );
    });
  }).catch((e) => {
    log.error(e, 'isProcessRunning -> err');

    return Promise.resolve(false);
  });
};
