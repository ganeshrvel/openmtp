import { log } from '../../../utils/log';
import { Kalam } from '../../../../ffi/kalam/src/Kalam';
import { checkIf } from '../../../utils/checkIf';
import { isArray, isEmpty } from '../../../utils/funcs';
import { getEnableFilesPreprocessingBeforeTransferSetting } from '../../../helpers/settings';
import { msToTime } from '../../../utils/date';

export class FileExplorerKalamDataSource {
  constructor() {
    this.kalamFfi = new Kalam();
  }

  /**
   * description - Initialize Kalam MTP
   *
   * @return {Promise<{data: object, error: string|null, stderr: string|null}>}
   */
  async initialize() {
    try {
      return this.kalamFfi.initialize();
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
   * description - Dispose Kalam MTP
   *
   * @return {Promise<{data: object, error: string|null, stderr: string|null}>}
   */
  async dispose() {
    try {
      return this.kalamFfi.dispose();
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
   * description - Fetch Kalam MTP storages
   *
   * @return {Promise<{data: {}, error: string|null, stderr: string|null}>}
   */
  async listStorages() {
    try {
      const { error, stderr, data } = await this.kalamFfi.listStorages();

      if (error || stderr || !data) {
        return { error, stderr, data };
      }

      const storageList = {};

      data.forEach((a, index) => {
        storageList[`${a.Sid}`] = {
          name: a.Info.StorageDescription,
          selected: index === 0,
          info: a.Info,
        };
      });

      return { error, stderr, data: storageList };
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
    checkIf(filePath, 'string');
    checkIf(ignoreHidden, 'boolean');
    checkIf(storageId, 'numericString');

    try {
      return this.kalamFfi.walk({
        fullPath: filePath,
        storageId,
        skipHiddenFiles: ignoreHidden,
      });
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
   * description - Rename a device file
   *
   * @param filePath
   * @param newFilename
   * @param storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async renameFile({ filePath, newFilename, storageId }) {
    checkIf(filePath, 'string');
    checkIf(newFilename, 'string');
    checkIf(storageId, 'numericString');

    try {
      return this.kalamFfi.renameFile({
        fullPath: filePath,
        storageId,
        newFilename,
      });
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
   * description - Check if files exist in the device
   *
   * @param {[string]} fileList
   * @param {string} storageId
   * @return {Promise<boolean>}
   */
  async filesExist({ fileList, storageId }) {
    checkIf(fileList, 'array');
    checkIf(storageId, 'numericString');

    try {
      const { error, stderr, data } = await this.kalamFfi.fileExist({
        storageId,
        files: fileList,
      });

      if (error || stderr) {
        return true;
      }

      if (isEmpty(data)) {
        return true;
      }

      const existsItems = data.filter((a) => a.exists);

      return existsItems.length > 0;
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
   * description - Create a device directory
   *
   * @param filePath
   * @param storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async makeDirectory({ filePath, storageId }) {
    checkIf(filePath, 'string');
    checkIf(storageId, 'numericString');

    try {
      return this.kalamFfi.makeDirectory({
        storageId,
        fullPath: filePath,
      });
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Delete device files
   *
   * @param fileList [string]
   * @param storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async deleteFiles({ fileList, storageId }) {
    checkIf(fileList, 'array');
    checkIf(storageId, 'numericString');

    return this.kalamFfi.deleteFile({
      storageId,
      files: fileList,
    });
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
   * @typedef {function(preprocessCallbackInfo)} preprocessCallback
   * @callback preprocessCallback
   * @param {preprocessCallbackInfo} args - preprocess object
   */

  /**
   * @typedef {Object} preprocessCallbackInfo
   * @property {string} fullPath - full file path
   * @property {number} name - file name
   */

  /**
   * @typedef {function(progressCallbackInfo)} progressCallback
   * @callback progressCallback
   * @param {progressCallbackInfo} args - progress object
   */

  /**
   * @typedef {Object} progressCallbackInfo
   * @property {number} totalFiles - [count] total number of files to transfer. note: this value will be 0 if pre-processing is false
   * @property {number} filesSent - [count] total number of files sent
   * @property {number} filesSentProgress - [count] total number of files sent (in percentage)
   *
   * @property {number} totalFileSize - [size] total size to transfer. note: this value will be 0 if pre-processing was false
   * @property {number} totalFileSizeSent - [size] total size sent
   * @property {number} totalFileProgress - [size] total size sent (in percentage)
   *
   * @property {number} activeFileSize - [size] total size of the current file
   * @property {number} activeFileSizeSent - [size] total size of the current file sent
   * @property {number} activeFileProgress - [size] total size of the current file sent (in percentage)
   *
   * @property {string} currentFile - current file (full path)
   * @property {string} speed - transfer rate (in MB/s)
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
   * @param {preprocessCallback} onPreprocess
   * @param {progressCallback} onProgress
   * @param {completedCallback} onCompleted
   *
   * @return
   */
  async transferFiles({
    destination,
    fileList,
    direction,
    storageId,
    onError,
    onPreprocess,
    onProgress,
    onCompleted,
  }) {
    checkIf(direction, 'string');
    checkIf(storageId, 'numericString');
    checkIf(onError, 'function');
    checkIf(onPreprocess, 'function');
    checkIf(onProgress, 'function');
    checkIf(onCompleted, 'function');

    try {
      if (isEmpty(destination)) {
        onError({
          error: `Invalid path`,
          stderr: null,
          data: null,
        });

        return;
      }

      if (isEmpty(fileList) || !isArray(fileList)) {
        onError({
          error: `No files selected`,
          stderr: null,
          data: null,
        });

        return;
      }

      return this.kalamFfi.transferFiles({
        direction,
        storageId,
        destination,
        preprocessFiles: getEnableFilesPreprocessingBeforeTransferSetting(),
        sources: fileList,
        onPreprocess,
        onProgress: ({
          fullPath,
          elapsedTime,
          speed,
          totalFiles,
          filesSent,
          filesSentProgress,
          activeFileSize,
          bulkFileSize,
        }) => {
          onProgress({
            currentFile: fullPath,
            elapsedTime: msToTime(elapsedTime),
            speed: `${speed} MB`,
            totalFiles,
            filesSent,
            filesSentProgress,
            totalFileSize: bulkFileSize.total,
            totalFileSizeSent: bulkFileSize.sent,
            totalFileProgress: bulkFileSize.progress,
            activeFileSize: activeFileSize.total,
            activeFileSizeSent: activeFileSize.sent,
            activeFileProgress: activeFileSize.progress,
          });
        },
        onError,
        onCompleted,
      });
    } catch (e) {
      log.error(e);
    }
  }

  catch(e) {
    log.error(e);

    return { error: e, stderr: null, data: false };
  }
}
