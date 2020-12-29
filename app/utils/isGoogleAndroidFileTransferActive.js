import { exec } from 'child_process';
import Promise from 'bluebird';
import { log } from './log';
import { checkIf } from './checkIf';

export const isProcessRunning = (query) => {
  checkIf(query, 'string');

  const { platform } = process;
  let cmd = '';

  switch (platform) {
    case 'win32':
      cmd = `tasklist`;
      break;
    case 'darwin':
      cmd = `pgrep -fil "${query}"`;
      break;
    case 'linux':
      cmd = `ps -A`;
      break;
    default:
      break;
  }

  return new Promise((resolve) => {
    exec(cmd, (err, stdout, stderr) => {
      console.log('err', err);
      console.log('stderr', stderr);
      console.log('stdout', stdout);

      if (err?.code === 3) {
        log.error(err, 'isProcessRunning -> err');

        return resolve(false);
      }

      if (stderr?.code === 3) {
        log.error(stderr, 'isProcessRunning -> stderr');

        return resolve(false);
      }

      return resolve(
        typeof stdout !== 'undefined' && stdout !== null && stdout !== ''
      );
    });
  }).catch((e) => {
    log.error(e, 'isProcessRunning -> catch');
  });
};

export const isGoogleAndroidFileTransferActive = async () => {
  const isAftRunning = await isProcessRunning('Android File transfer.app');
  const isAftAgentRunning = await isProcessRunning(
    'Android File Transfer Agent.app'
  );

  return isAftRunning && isAftAgentRunning;
};
