import { log } from '../../../utils/log';
import { Kalam } from '../../../../ffi/kalam/src/Kalam';
import { checkIf } from '../../../utils/checkIf';
import { isArray, isEmpty } from '../../../utils/funcs';

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
   * @property {number} percentage - percentage
   * @property {number} activeFileSize - total size of the current file
   * @property {number} activeFileSent - total bytes of the current file transferred
   * @property {string} currentFile - current file
   * @property {string} speed - speed
   * @property {string} elapsedTime - elapsed time
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

      switch (direction) {
        case 'download':
          return;

        case 'upload':
          return;

        default:
          break;
      }
    } catch (e) {
      log.error(e);
    }
  }

  catch(e) {
    log.error(e);

    return { error: e, stderr: null, data: false };
  }
}
