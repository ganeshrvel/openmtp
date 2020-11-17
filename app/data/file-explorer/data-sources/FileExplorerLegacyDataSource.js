import path from 'path';
import { Promise } from 'bluebird';
import moment from 'moment';
import findLodash from 'lodash/find';
import { exec, spawn } from 'child_process';
import { log } from '../../../utils/log';
import {
  isArray,
  isEmpty,
  niceBytes,
  percentage,
  splitIntoLines,
  undefinedOrNull,
} from '../../../utils/funcs';
import { DEVICES_LABEL } from '../../../constants';
import { DEVICE_TYPE } from '../../../enums';
import { baseName, getExtension } from '../../../utils/files';
import { mtp as _mtpCli } from '../../../utils/binaries';
import { msToTime, unixTimestampNow } from '../../../utils/date';
import { checkIf } from '../../../utils/checkIf';

export class FileExplorerLegacyDataSource {
  constructor() {
    this.mtpCli = `"${this._escapeShellMtp(_mtpCli)}"`;
    this.execPromise = Promise.promisify(exec);
  }

  _escapeShellMtp(cmd) {
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
  }

  _filterOutMtpLines(string, index) {
    return (
      this._filterJunkMtpErrors(string) ||
      (index < 2 && string.toLowerCase().indexOf(`selected storage`) !== -1)
    );
  }

  _filterJunkMtpErrors(string) {
    return (
      string === '\n' ||
      string === '\r\n' ||
      string === '' ||
      string.toLowerCase().indexOf(`device::find failed`) !== -1 ||
      string.toLowerCase().indexOf(`iocreateplugininterfaceforservice`) !==
        -1 ||
      string.toLowerCase().indexOf(`Device::Find failed`) !== -1
    );
  }

  _cleanJunkMtpError({ error = null, stdout = null, stderr = null }) {
    const splittedError = splitIntoLines(error);
    const filteredError = splittedError
      ? splittedError.filter((a) => !this._filterJunkMtpErrors(a))
      : [];

    const splittedStderr = splitIntoLines(stderr);
    const filteredStderr = splittedStderr
      ? splittedStderr.filter((a) => !this._filterJunkMtpErrors(a))
      : [];

    return {
      filteredError,
      filteredStderr,
      filteredStdout: stdout,
    };
  }

  async _exec(command) {
    try {
      return new Promise((resolve) => {
        this.execPromise(command, (error, stdout, stderr) => {
          const {
            filteredStderr,
            filteredError,
            filteredStdout,
          } = this._cleanJunkMtpError({ error, stdout, stderr });

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
  }

  async _execNoCatch(command) {
    return new Promise((resolve) => {
      this.execPromise(command, (error, stdout, stderr) => {
        const {
          filteredStderr,
          filteredError,
          filteredStdout,
        } = this._cleanJunkMtpError({ error, stdout, stderr });

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
  }

  async _checkMtpFileExists(filePath, storageId) {
    const storageSelectCmd = `"storage ${storageId}"`;
    const escapedFilePath = `${this._escapeShellMtp(filePath)}`;

    const { stderr } = await this._execNoCatch(
      `${this.mtpCli} ${storageSelectCmd} "properties \\"${escapedFilePath}\\""`
    );

    return !stderr;
  }

  /**
   * description - file transfer helper
   *
   * @param {[string]} cmdArgs - command line strings in an array
   * @param {errorCallback} onError
   * @param {progressCallback} onProgress
   * @param {completedCallback} onCompleted
   * @return {Promise<{data: boolean, error: string|null, stderr: string|null}>}
   * @private
   */
  async _transferFiles({ cmdArgs, onError, onProgress, onCompleted }) {
    try {
      checkIf(cmdArgs, 'array');
      checkIf(onError, 'function');
      checkIf(onProgress, 'function');
      checkIf(onCompleted, 'function');

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

        const {
          percentage: _percentage,
          currentFile,
          activeFileSize,
          activeFileSent,
        } = transferList;

        const copiedTimeDiff = currentCopiedTime - prevCopiedTime;
        const speed =
          prevCopiedBlockSize &&
          prevCopiedBlockSize - currentCopiedBlockSize > 0
            ? (prevCopiedBlockSize - currentCopiedBlockSize) *
              (1000 / copiedTimeDiff)
            : 0;
        const _speed = speed ? `${niceBytes(speed)}` : `--`;
        const elapsedTime = msToTime(currentCopiedTime - startTime);
        prevCopiedTime = currentCopiedTime;
        prevCopiedBlockSize = currentCopiedBlockSize;

        onProgress({
          elapsedTime,
          speed: _speed,
          percentage: _percentage,
          currentFile,
          activeFileSize,
          activeFileSent,
        });
      }, handletransferListTimeInterval);

      const cmd = spawn(this.mtpCli, [...cmdArgs], {
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
          (a, index) => !this._filterOutMtpLines(a, index)
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
            currentFile: filePath,
            activeFileSize: totalFileSize,
            activeFileSent: currentProgressSize,
            percentage: perc,
            currentCopiedBlockSize,
            currentCopiedTime,
          };
        }
      });

      // capture error
      cmd.stderr.on('data', (error) => {
        const { filteredError } = this._cleanJunkMtpError({ error });

        if (undefinedOrNull(filteredError) || filteredError.length < 1) {
          return null;
        }

        onError({
          error,
          stderr: null,
          data: null,
        });

        transferList = null;
      });

      cmd.on('exit', () => {
        transferList = null;

        onCompleted();
      });

      return { error: null, stderr: null, data: true };
    } catch (e) {
      log.error(e);

      return { error: null, stderr: null, data: false };
    }
  }

  /**
   * description - Fetch MTP storages
   *
   * @return {Promise<{data: object|boolean, error: string|null, stderr: string|null}>}
   */
  async listStorages() {
    try {
      const { data, error, stderr } = await this._exec(
        `${this.mtpCli} "storage-list"`
      );

      if (error || stderr) {
        log.error(
          `${error} : ${stderr}`,
          `FileExplorerLegacyDataSource.listStorages -> storage-list error`,
          false
        );
        return { error, stderr, data: null };
      }

      const _storageList = splitIntoLines(data);

      const descMatchPattern = /description:(.*)/i;
      const storageIdMatchPattern = /([^\D]+)/;

      let storageList = {};
      _storageList
        .filter((a, index) => !this._filterOutMtpLines(a, index))
        .map((a, index) => {
          if (!a) {
            return null;
          }
          const _matchDesc = descMatchPattern.exec(a);
          const _matchedStorageIds = storageIdMatchPattern.exec(a);

          if (
            undefinedOrNull(_matchDesc) ||
            undefinedOrNull(_matchDesc[1]) ||
            undefinedOrNull(_matchedStorageIds) ||
            undefinedOrNull(_matchedStorageIds[1])
          ) {
            return null;
          }

          const matchDesc = _matchDesc[1].trim();
          const matchedStorageId = _matchedStorageIds[1].trim();
          storageList = {
            ...storageList,
            [matchedStorageId]: {
              name: matchDesc,
              selected: index === 0,
            },
          };

          return storageList;
        });

      if (undefinedOrNull(storageList) || storageList.length < 1) {
        return {
          error: `${DEVICES_LABEL[DEVICE_TYPE.mtp]} storage not accessible`,
          stderr: null,
          data: null,
        };
      }

      return { error: null, stderr: null, data: storageList };
    } catch (e) {
      log.error(e);

      return {
        error: e,
        stderr: null,
        data: null,
      };
    }
  }

  /**
   * description - Fetch device files in the path
   *
   * @param filePath
   * @param ignoreHidden
   * @param storageId
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async listFiles({ filePath, ignoreHidden, storageId }) {
    try {
      const mtpCmdChopIndex = {
        type: 2,
        dateAdded: 4,
        timeAdded: 5,
      };
      const response = [];
      const storageSelectCmd = `"storage ${storageId}"`;

      const {
        data: filePropsData,
        error: filePropsError,
        stderr: filePropsStderr,
      } = await this._exec(
        `${this.mtpCli} ${storageSelectCmd} "lsext \\"${this._escapeShellMtp(
          filePath
        )}\\""`
      );

      if (filePropsError || filePropsStderr) {
        log.error(
          `${filePropsError} : ${filePropsStderr}`,
          `listFiles -> lsext error`
        );

        return { error: filePropsError, stderr: filePropsStderr, data: null };
      }

      let fileProps = splitIntoLines(filePropsData);

      fileProps = fileProps.filter(
        (a, index) => !this._filterOutMtpLines(a, index)
      );

      for (let i = 0; i < fileProps.length; i += 1) {
        const item = fileProps[i];
        const matchedProps = item.match(
          /^(.*?)\s+\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/g
        );

        if (matchedProps === null || matchedProps.length < 1) {
          continue; // eslint-disable-line no-continue
        }

        const _matchedProps = matchedProps[0];
        const itemSplit = item.split(_matchedProps);

        if (itemSplit === null || itemSplit.length < 2 || itemSplit[1] === '') {
          continue; // eslint-disable-line no-continue
        }
        const matchedFileName = itemSplit[1].replace(/^\s{2}|\s$/g, '');
        const filePropsList = _matchedProps.replace(/\s\s+/g, ' ').split(' ');

        // eslint-disable-next-line no-useless-escape
        if (ignoreHidden && /(^|\/)\.[^\/\.]/g.test(matchedFileName)) {
          continue; // eslint-disable-line no-continue
        }

        const fullPath = path.resolve(filePath, matchedFileName);
        const isFolder = filePropsList[mtpCmdChopIndex.type] === '3001';
        const dateTime = `${filePropsList[mtpCmdChopIndex.dateAdded]} ${
          filePropsList[mtpCmdChopIndex.timeAdded]
        }`;
        const extension = getExtension(fullPath, isFolder);

        // avoid duplicate values
        if (findLodash(response, { path: fullPath })) {
          continue; // eslint-disable-line no-continue
        }
        response.push({
          name: matchedFileName,
          path: fullPath,
          extension,
          size: null,
          isFolder,
          dateAdded: moment(dateTime).format('YYYY-MM-DD HH:mm:ss'),
        });
      }

      return { error: null, stderr: null, data: response };
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: null };
    }
  }

  /**
   * description - Rename a device file
   *
   * @param filePath
   * @param newFilename
   * @param storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async renameFile({ filePath, newFilename, storageId }) {
    try {
      if (undefinedOrNull(filePath) || undefinedOrNull(newFilename)) {
        return { error: `No files selected.`, stderr: null, data: null };
      }

      const storageSelectCmd = `"storage ${storageId}"`;
      const escapedFilePath = `${this._escapeShellMtp(filePath)}`;
      const escapedNewFilename = `${this._escapeShellMtp(newFilename)}`;

      const { error, stderr } = await this._exec(
        `${this.mtpCli} ${storageSelectCmd} "rename \\"${escapedFilePath}\\" \\"${escapedNewFilename}\\""`
      );

      if (error || stderr) {
        log.error(
          `${error} : ${stderr}`,
          `FileExplorerLegacyDataSource.renameFile -> rename error`
        );

        return { error, stderr, data: false };
      }

      return { error: null, stderr: null, data: true };
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Delete device files
   *
   * @param fileList
   * @param storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async deleteFiles({ fileList, storageId }) {
    try {
      if (!fileList || fileList.length < 1) {
        return { error: `No files selected.`, stderr: null, data: null };
      }

      const storageSelectCmd = `"storage ${storageId}"`;
      for (let i = 0; i < fileList.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const { error, stderr } = await this._exec(
          `${this.mtpCli} ${storageSelectCmd} "rm \\"${this._escapeShellMtp(
            fileList[i]
          )}\\""`
        );

        if (error || stderr) {
          log.error(
            `${error} : ${stderr}`,
            `FileExplorerLegacyDataSource.deleteFiles -> rm error`
          );
          return { error, stderr, data: false };
        }
      }

      return { error: null, stderr: null, data: true };
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Create a device directory
   *
   * @param filePath
   * @param storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async makeDirectory({ filePath, storageId }) {
    try {
      if (undefinedOrNull(filePath)) {
        return { error: `Invalid path.`, stderr: null, data: null };
      }

      const storageSelectCmd = `"storage ${storageId}"`;
      const escapedFilePath = `${this._escapeShellMtp(filePath)}`;
      const { error, stderr } = await this._exec(
        `${this.mtpCli} ${storageSelectCmd} "mkpath \\"${escapedFilePath}\\""`
      );

      if (error || stderr) {
        log.error(
          `${error} : ${stderr}`,
          `FileExplorerLegacyDataSource.makeDirectory -> mkpath error`
        );
        return { error, stderr, data: false };
      }

      return { error: null, stderr: null, data: true };
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Check if files exist in the device
   *
   * @param {[string]} fileList
   * @param {string} storageId
   * @return {Promise<boolean>}
   */
  async filesExist({ fileList, storageId }) {
    try {
      if (!isArray(fileList)) {
        return false;
      }

      if (isEmpty(fileList)) {
        return false;
      }

      for (let i = 0; i < fileList.length; i += 1) {
        const item = fileList[i];
        const fullPath = path.resolve(item);

        // eslint-disable-next-line no-await-in-loop
        if (await this._checkMtpFileExists(fullPath, storageId)) {
          return true;
        }
      }

      return false;
    } catch (e) {
      log.error(e);

      return false;
    }
  }

  /**
   * @typedef {function(errorCallbackInfo)} errorCallback
   * @callback errorCallback
   * @param {errorCallbackInfo} args - error object
   */

  /**
   * @typedef {Object} errorCallbackInfo
   * @property {string} error - error text
   * @property {string} stderr - std error text
   * @property {null} data - data
   */

  /**
   * @typedef {function(progressCallbackInfo)} progressCallback
   * @callback progressCallback
   * @param {progressCallbackInfo} args - progress object
   */

  /**
   * @typedef {Object} progressCallbackInfo
   * @property {number} percentage - percentage
   * @property {number} activeFileSize - total size of the current file
   * @property {number} activeFileSent - total bytes of the current file transferred
   * @property {string} currentFile - current file
   * @property {string} speed - speed
   * @property {string} elapsedTime - elapsed time
   */

  /**
   * @typedef {function()} completedCallback
   * @callback completedCallback
   */

  /**
   * description - Upload or download files from MTP device to local or vice versa
   *
   * @param {string} destination
   * @param {'upload'|'download'} direction
   * @param {[string]} fileList
   * @param {string} storageId
   * @param {errorCallback} onError
   * @param {progressCallback} onProgress
   * @param {completedCallback} onCompleted
   *
   * @return
   */
  transferFiles = ({
    destination,
    fileList,
    direction,
    storageId,
    onError,
    onProgress,
    onCompleted,
  }) => {
    checkIf(onError, 'function');
    checkIf(onProgress, 'function');
    checkIf(onCompleted, 'function');

    try {
      if (undefinedOrNull(destination)) {
        onError({
          error: `Invalid path`,
          stderr: null,
          data: null,
        });

        return;
      }

      const storageSelectCmd = `"storage ${storageId}"`;

      if (isEmpty(fileList) || !isArray(fileList)) {
        onError({
          error: `No files selected`,
          stderr: null,
          data: null,
        });

        return;
      }

      let cmdArgs = [];
      switch (direction) {
        case 'download':
          cmdArgs = (fileList ?? []).map((sourcePath) => {
            const destinationPath = path.resolve(destination);
            const escapedDestinationPath = this._escapeShellMtp(
              `${destinationPath}/${baseName(sourcePath)}`
            );
            const escapedSourcePath = `${this._escapeShellMtp(sourcePath)}`;

            return `-e ${storageSelectCmd} "get \\"${escapedSourcePath}\\" \\"${escapedDestinationPath}\\""`;
          });

          return this._transferFiles({
            cmdArgs,
            onError,
            onProgress,
            onCompleted,
          });

        case 'upload':
          cmdArgs = (fileList ?? []).map((sourcePath) => {
            const destinationPath = path.resolve(destination);
            const escapedDestinationPath = `${this._escapeShellMtp(
              destinationPath
            )}`;
            const escapedSourcePath = `${this._escapeShellMtp(sourcePath)}`;

            return `-e ${storageSelectCmd} "put \\"${escapedSourcePath}\\" \\"${escapedDestinationPath}\\""`;
          });

          return this._transferFiles({
            cmdArgs,
            onError,
            onProgress,
            onCompleted,
          });

        default:
          break;
      }
    } catch (e) {
      log.error(e);
    }
  };
}
