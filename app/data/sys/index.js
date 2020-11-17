/* eslint no-await-in-loop: off */

import { existsSync } from 'fs';
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
  isArray,
  undefinedOrNull,
} from '../../utils/funcs';
import { msToTime, unixTimestampNow } from '../../utils/date';
import { baseName } from '../../utils/files';
import { DEVICE_TYPE } from '../../enums';

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

/**
 MTP device ->
 */

export const pasteFiles = (
  { ...pasteArgs },
  { ...listDirectoryArgs },
  direction,
  deviceType,
  dispatch,
  getState,
  getCurrentWindow
) => {
  try {
    const { destinationFolder, storageId, fileTransferClipboard } = pasteArgs;

    if (
      typeof destinationFolder === 'undefined' ||
      destinationFolder === null
    ) {
      dispatch(
        processMtpOutput({
          deviceType,
          error: `Invalid path.`,
          stderr: null,
          data: null,
          callback: () => {
            dispatch(
              listDirectory({ ...listDirectoryArgs }, deviceType, getState)
            );
          },
        })
      );
    }

    const storageSelectCmd = `"storage ${storageId}"`;
    const { queue } = fileTransferClipboard;

    if (typeof queue === 'undefined' || queue === null || queue.length < 1) {
      dispatch(
        processMtpOutput({
          deviceType,
          error: `No files selected`,
          stderr: null,
          data: null,
          callback: () => {
            dispatch(
              listDirectory({ ...listDirectoryArgs }, deviceType, getState)
            );
          },
        })
      );
    }

    let _queue = [];
    let cmdArgs = {};
    switch (direction) {
      case 'mtpToLocal':
        _queue = (queue || []).map((sourcePath) => {
          const destinationPath = path.resolve(destinationFolder);
          const escapedDestinationPath = escapeShellMtp(
            `${destinationPath}/${baseName(sourcePath)}`
          );
          const escapedSourcePath = `${escapeShellMtp(sourcePath)}`;

          return `-e ${storageSelectCmd} "get \\"${escapedSourcePath}\\" \\"${escapedDestinationPath}\\""`;
        });

        cmdArgs = {
          _queue,
        };
        return _pasteFiles(
          { ...pasteArgs },
          { ...listDirectoryArgs },
          { ...cmdArgs },
          deviceType,
          dispatch,
          getState,
          getCurrentWindow
        );

      case 'localtoMtp':
        _queue = (queue || []).map((sourcePath) => {
          const destinationPath = path.resolve(destinationFolder);
          const escapedDestinationPath = `${escapeShellMtp(destinationPath)}`;
          const escapedSourcePath = `${escapeShellMtp(sourcePath)}`;

          return `-e ${storageSelectCmd} "put \\"${escapedSourcePath}\\" \\"${escapedDestinationPath}\\""`;
        });

        cmdArgs = {
          _queue,
        };

        return _pasteFiles(
          { ...pasteArgs },
          { ...listDirectoryArgs },
          { ...cmdArgs },
          deviceType,
          dispatch,
          getState,
          getCurrentWindow
        );

      default:
        break;
    }
  } catch (e) {
    log.error(e);
  }
};

const _pasteFiles = (
  { ...pasteArgs }, // eslint-disable-line no-unused-vars
  { ...listDirectoryArgs }, // eslint-disable-line no-unused-vars
  { ...cmdArgs },
  deviceType,
  dispatch,
  getState,
  getCurrentWindow
) => {
  try {
    const { _queue } = cmdArgs;
    const handletransferListTimeInterval = 1000;
    let transferList = {};
    let prevCopiedBlockSize = 0;
    let currentCopiedBlockSize = 0;
    let startTime = 0;
    let prevCopiedTime = 0;
    let currentCopiedTime = 0;
    let bufferedOutput = null;

    let handleTransferListInterval = setInterval(() => {
      if (transferList === null) {
        clearInterval(handleTransferListInterval);
        handleTransferListInterval = 0;
        return null;
      }

      if (Object.keys(transferList).length < 1) {
        return null;
      }

      const { percentage: _percentage, bodyText1, bodyText2 } = transferList;
      const copiedTimeDiff = currentCopiedTime - prevCopiedTime;
      const speed =
        prevCopiedBlockSize && prevCopiedBlockSize - currentCopiedBlockSize > 0
          ? (prevCopiedBlockSize - currentCopiedBlockSize) *
            (1000 / copiedTimeDiff)
          : 0;
      const _speed = speed ? `${niceBytes(speed)}` : `--`;
      const elapsedTime = msToTime(currentCopiedTime - startTime);
      prevCopiedTime = currentCopiedTime;
      prevCopiedBlockSize = currentCopiedBlockSize;

      getCurrentWindow().setProgressBar(_percentage / 100);
      dispatch(
        setFileTransferProgress({
          toggle: true,
          bodyText1,
          bodyText2: `Elapsed: ${elapsedTime} | Progress: ${bodyText2} @ ${_speed}/sec`,
          percentage: _percentage,
        })
      );
    }, handletransferListTimeInterval);

    const cmd = spawn(mtpCli, [..._queue], {
      shell: true,
    });

    cmd.stdout.on('data', (data) => {
      bufferedOutput = data.toString();

      if (startTime === 0) {
        startTime = unixTimestampNow();
      }

      if (
        typeof bufferedOutput === 'undefined' ||
        bufferedOutput === null ||
        bufferedOutput.length < 1
      ) {
        return null;
      }

      const _bufferedOutput = splitIntoLines(bufferedOutput).filter(
        (a, index) => !filterOutMtpLines(a, index)
      );

      if (_bufferedOutput.length < 1) {
        return null;
      }

      for (let i = 0; i < _bufferedOutput.length; i += 1) {
        const item = _bufferedOutput[i];
        const bufferedOutputSplit = item.split(' ');

        if (bufferedOutputSplit.length < 1) {
          return null;
        }

        const totalLength = bufferedOutputSplit.length;
        const eventIndex = 0;
        const filePathStartIndex = 1;
        const filePathEndIndex = totalLength - 3;
        const currentProgressSizeIndex = totalLength - 2;
        const totalFileSizeIndex = totalLength - 1;

        const event = bufferedOutputSplit[eventIndex];
        const matchedItem = item.match(/(\d+?\d*)\s(\d+?\d*)$/);
        if (matchedItem === null) {
          return null;
        }

        const matchedItemSplit = matchedItem[0].split(' ');
        const currentProgressSize = parseInt(matchedItemSplit[0], 10);
        const totalFileSize = parseInt(matchedItemSplit[1], 10);

        if (event === `:done`) {
          prevCopiedBlockSize = 0;
          currentCopiedBlockSize = 0;
          prevCopiedTime = 0;
          currentCopiedTime = 0;
          return null;
        }

        if (
          totalLength < 3 ||
          event !== `:progress` ||
          currentProgressSizeIndex < 2 ||
          totalFileSizeIndex < 3
        ) {
          return null;
        }

        const filePath = bufferedOutputSplit
          .slice(filePathStartIndex, filePathEndIndex + 1)
          .join(' ');

        const perc = percentage(currentProgressSize, totalFileSize);
        currentCopiedBlockSize = totalFileSize - currentProgressSize;
        currentCopiedTime = unixTimestampNow();

        transferList = {
          bodyText1: `${perc}% complete of ${truncate(baseName(filePath), 45)}`,
          bodyText2: `${niceBytes(currentProgressSize)} / ${niceBytes(
            totalFileSize
          )}`,
          percentage: perc,
          currentCopiedBlockSize,
          currentCopiedTime,
        };
      }
    });

    cmd.stderr.on('data', (error) => {
      const { filteredError } = cleanJunkMtpError({ error });

      if (undefinedOrNull(filteredError) || filteredError.length < 1) {
        return null;
      }

      dispatch(
        processMtpOutput({
          deviceType,
          error,
          stderr: null,
          data: null,
          callback: () => {
            transferList = null;
            getCurrentWindow().setProgressBar(-1);
            dispatch(clearFileTransfer());
            dispatch(
              listDirectory({ ...listDirectoryArgs }, deviceType, getState)
            );
          },
        })
      );
    });

    cmd.on('exit', () => {
      transferList = null;
      getCurrentWindow().setProgressBar(-1);
      dispatch(clearFileTransfer());
      dispatch(listDirectory({ ...listDirectoryArgs }, deviceType, getState));
    });

    return { error: null, stderr: null, data: true };
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
