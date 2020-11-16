import { Promise } from 'bluebird';
import { exec } from 'child_process';
import { mtp as _mtpCli } from './binaries';
import { splitIntoLines, undefinedOrNull } from './funcs';
import { log } from './log';

const execPromise = Promise.promisify(exec);

/**
 * description - This hack is to support flex quotes parser for mtp cli.
 *
 * @param {string} cmd - command
 *
 * @returns {string} cmd
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

export const mtpCli = `"${escapeShellMtp(_mtpCli)}"`;

export const filterOutMtpLines = (string, index) => {
  return (
    filterJunkMtpErrors(string) ||
    (index < 2 && string.toLowerCase().indexOf(`selected storage`) !== -1)
  );
};

export const filterJunkMtpErrors = (string) => {
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

export const promisifiedExec = (command) => {
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

export const promisifiedExecNoCatch = (command) => {
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
        data: stdout,
        stderr,
        error,
      });
    });
  });
};
