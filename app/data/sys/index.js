/* eslint no-await-in-loop: off */

import Promise from 'bluebird';
import path from 'path';
import { spawn, exec } from 'child_process';
import { log } from '../../utils/log';
import { mtp as _mtpCli } from '../../utils/binaries';

import {
  clearFileTransfer,
  listDirectory,
  processMtpOutput,
  setFileTransferProgress,
} from '../../containers/HomePage/actions';
import {
  niceBytes,
  percentage,
  splitIntoLines,
  truncate,
  undefinedOrNull,
} from '../../utils/funcs';
import { msToTime, unixTimestampNow } from '../../utils/date';
import { baseName } from '../../utils/files';

const execPromise = Promise.promisify(exec);

/**
 * This hack is to support flex quotes parser for mtp cli.
 */
export const escapeShellMtp = (cmd) => {
  if (cmd.indexOf(`\\"`) !== -1 && cmd.indexOf(`"\\`) !== -1) {
    return cmd
      .replace(/`/g, '\\`')
      .replace(/\\/g, `\\\\\\\\`)
      .replace(/"/g, `\\\\\\"`);
  }
  if (cmd.indexOf(`"\\"`) !== -1) {
    return cmd
      .replace(/`/g, '\\`')
      .replace(/\\/g, `\\\\\\\\`)
      .replace(/"/g, `\\\\\\"`);
  }
  if (cmd.indexOf(`\\"`) !== -1) {
    return cmd
      .replace(/`/g, '\\`')
      .replace(/\\/g, `\\\\\\`)
      .replace(/"/g, `\\\\\\\\"`);
  }
  if (cmd.indexOf(`"\\`) !== -1) {
    return cmd
      .replace(/`/g, '\\`')
      .replace(/\\/g, `\\\\\\\\`)
      .replace(/"/g, `\\\\\\"`);
  }
  return cmd
    .replace(/`/g, '\\`')
    .replace(/\\/g, `\\\\\\`)
    .replace(/"/g, `\\\\\\"`);
};

const mtpCli = `"${escapeShellMtp(_mtpCli)}"`;

const filterOutMtpLines = (string, index) => {
  return (
    filterJunkMtpErrors(string) ||
    (index < 2 && string.toLowerCase().indexOf(`selected storage`) !== -1)
  );
};

const filterJunkMtpErrors = (string) => {
  return (
    string === '\n' ||
    string === '\r\n' ||
    string === '' ||
    string.toLowerCase().indexOf(`device::find failed`) !== -1 ||
    string.toLowerCase().indexOf(`iocreateplugininterfaceforservice`) !== -1 ||
    string.toLowerCase().indexOf(`Device::Find failed`) !== -1
  );
};

const cleanJunkMtpError = ({ error = null, stdout = null, stderr = null }) => {
  const splittedError = splitIntoLines(error);
  const filteredError = splittedError
    ? splittedError.filter((a) => !filterJunkMtpErrors(a))
    : [];

  const splittedStderr = splitIntoLines(stderr);
  const filteredStderr = splittedStderr
    ? splittedStderr.filter((a) => !filterJunkMtpErrors(a))
    : [];

  return {
    filteredError,
    filteredStderr,
    filteredStdout: stdout,
  };
};

const promisifiedExec = (command) => {
  try {
    return new Promise((resolve) => {
      execPromise(command, (error, stdout, stderr) => {
        const {
          filteredStderr,
          filteredError,
          filteredStdout,
        } = cleanJunkMtpError({ error, stdout, stderr });

        if (
          (undefinedOrNull(filteredStderr) || filteredStderr.length < 1) &&
          (undefinedOrNull(filteredError) || filteredError.length < 1)
        ) {
          return resolve({
            data: filteredStdout,
            stderr: null,
            error: null,
          });
        }

        return resolve({
          data: filteredStdout,
          stderr: filteredStderr.join('\n'),
          error: filteredError.join('\n'),
        });
      });
    });
  } catch (e) {
    log.error(e);
  }
};

export const mtpVerboseReport = async () => {
  try {
    const { data, error, stderr } = await promisifiedExec(`${mtpCli} "pwd" -v`);

    if (error) {
      log.doLog(`${error}`);
      return { error, stderr, data: null };
    }
    if (stderr) {
      log.doLog(`${stderr}`);
      return { error, stderr, data: null };
    }

    return { error: null, stderr: null, data };
  } catch (e) {
    log.error(e);
  }
};
