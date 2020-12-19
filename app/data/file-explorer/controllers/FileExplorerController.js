import { FileExplorerRepository } from '../repositories/FileExplorerRepository';
import { checkIf } from '../../../utils/checkIf';
import { analyticsService } from '../../../services/analytics';
import { EVENT_TYPE } from '../../../enums/events';
import {
  processLocalBuffer,
  processMtpBuffer,
} from '../../../helpers/processBufferOutput';
import { getMtpModeSetting } from '../../../helpers/settings';
import { DEVICE_TYPE } from '../../../enums';

class FileExplorerController {
  constructor() {
    this.repository = new FileExplorerRepository();
  }

  async _sentEvent({ result, deviceType, eventKey }) {
    checkIf(eventKey, 'string');
    checkIf(deviceType, 'inObjectValues', DEVICE_TYPE);

    // events related to local disk actions
    if (deviceType === DEVICE_TYPE.local) {
      const { error: localError } = await processLocalBuffer({
        error: result.error,
        stderr: result.stderr,
      });

      if (localError) {
        const _eventKey = `${EVENT_TYPE[`LOCAL_${eventKey}_ERROR`]}`;

        // if the event key is not listed in the [EVENT_TYPE] object then don't proceed
        if (!_eventKey) {
          return;
        }

        // send out an error event
        await analyticsService.sendEvent(_eventKey, {
          stderr: result.stderr,
          error: result.error,
        });

        return;
      }

      const _eventKey = `${EVENT_TYPE[`LOCAL_${eventKey}_SUCCESS`]}`;

      // if the event key is not listed in the [EVENT_TYPE] object then don't proceed
      if (!_eventKey) {
        return;
      }

      // send a success event
      await analyticsService.sendEvent(_eventKey, {});

      return;
    }

    // events related to mtp actions
    const mtpMode = getMtpModeSetting();
    const { mtpStatus, error: mtpError } = await processMtpBuffer({
      error: result.error,
      stderr: result.stderr,
      mtpMode,
    });

    if (mtpError) {
      const _eventKey = `${EVENT_TYPE[`MTP_${eventKey}_ERROR`]}`;

      // if the event key is not listed in the [EVENT_TYPE] object then don't proceed
      if (!_eventKey) {
        return;
      }

      // send out an error event
      await analyticsService.sendEvent(_eventKey, {
        'MTP Status': mtpStatus,
        'MTP Mode': mtpMode,
        stderr: result.stderr,
        error: result.error,
      });

      return;
    }

    const _eventKey = `${EVENT_TYPE[`MTP_${eventKey}_SUCCESS`]}`;

    // if the event key is not listed in the [EVENT_TYPE] object then don't proceed
    if (!_eventKey) {
      return;
    }

    // send a success event
    await analyticsService.sendEvent(_eventKey, {
      'MTP Status': mtpStatus,
      'MTP Mode': mtpMode,
    });
  }

  /**
   * description - Initialize
   *
   * @return {Promise<{data: object, error: string|null, stderr: string|null}>}
   */
  async initialize({ deviceType }) {
    checkIf(deviceType, 'string');

    const result = await this.repository.initialize({ deviceType });

    this._sentEvent({ result, deviceType, eventKey: 'INITIALIZE' });

    return result;
  }

  /**
   * description - Dispose
   *
   * @return {Promise<{data: object, error: string|null, stderr: string|null}>}
   */
  async dispose({ deviceType }) {
    checkIf(deviceType, 'string');

    const result = await this.repository.dispose({ deviceType });

    this._sentEvent({ result, deviceType, eventKey: 'DISPOSE' });

    return result;
  }

  /**
   * description - Fetch storages
   *
   * @return {Promise<{data: object|boolean, error: string|null, stderr: string|null}>}
   */
  async listStorages({ deviceType }) {
    checkIf(deviceType, 'string');

    const result = await this.repository.listStorages({ deviceType });

    this._sentEvent({ result, deviceType, eventKey: 'LIST_STORAGES' });

    return result;
  }

  /**
   * description - Fetch files in the path
   *
   * @param {string} deviceType
   * @param {string} filePath
   * @param {string} ignoreHidden
   * @param {string} storageId
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async listFiles({ deviceType, filePath, ignoreHidden, storageId }) {
    checkIf(deviceType, 'string');
    checkIf(filePath, 'string');
    checkIf(ignoreHidden, 'boolean');

    const result = await this.repository.listFiles({
      deviceType,
      filePath,
      ignoreHidden,
      storageId,
    });

    this._sentEvent({ result, deviceType, eventKey: 'LIST_FILES' });

    return result;
  }

  /**
   * description - Rename a file
   *
   * @param {string} deviceType
   * @param {string} filePath
   * @param {string} newFilename
   * @param {string} storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async renameFile({ deviceType, filePath, newFilename, storageId }) {
    checkIf(deviceType, 'string');
    checkIf(filePath, 'string');
    checkIf(newFilename, 'string');

    const result = await this.repository.renameFile({
      deviceType,
      filePath,
      newFilename,
      storageId,
    });

    this._sentEvent({ result, deviceType, eventKey: 'RENAME_FILE' });

    return result;
  }

  /**
   * description - Delete files
   *
   * @param {string} deviceType
   * @param {[string]} fileList
   * @param {string} storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async deleteFiles({ deviceType, fileList, storageId }) {
    checkIf(deviceType, 'string');
    checkIf(fileList, 'array');

    const result = await this.repository.deleteFiles({
      deviceType,
      fileList,
      storageId,
    });

    this._sentEvent({ result, deviceType, eventKey: 'DELETE_FILE' });

    return result;
  }

  /**
   * description - Create a directory
   *
   * @param {string} deviceType
   * @param {string} filePath
   * @param {string} storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async makeDirectory({ deviceType, filePath, storageId }) {
    checkIf(deviceType, 'string');
    checkIf(filePath, 'string');

    const result = await this.repository.makeDirectory({
      deviceType,
      filePath,
      storageId,
    });

    this._sentEvent({ result, deviceType, eventKey: 'NEW_FOLDER' });

    return result;
  }

  /**
   * description - Check if files exist
   *
   * @param {string} deviceType
   * @param {[string]} fileList
   * @param {string} storageId
   * @return {Promise<boolean>}
   */
  async filesExist({ deviceType, fileList, storageId }) {
    checkIf(deviceType, 'string');
    checkIf(fileList, 'array');

    const result = await this.repository.filesExist({
      deviceType,
      fileList,
      storageId,
    });

    this._sentEvent({ result, deviceType, eventKey: 'FILES_EXIST' });

    return result;
  }

  /**
   * description - Upload or download files from MTP device to local or vice versa
   *
   * @param {string} deviceType
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
  transferFiles = async ({
    deviceType,
    destination,
    fileList,
    direction,
    storageId,
    onError,
    onPreprocess,
    onProgress,
    onCompleted,
  }) => {
    checkIf(deviceType, 'string');
    checkIf(destination, 'string');
    checkIf(direction, 'string');
    checkIf(fileList, 'array');
    checkIf(onError, 'function');
    checkIf(onPreprocess, 'function');
    checkIf(onProgress, 'function');
    checkIf(onCompleted, 'function');

    const result = await this.repository.transferFiles({
      deviceType,
      destination,
      fileList,
      direction,
      storageId,
      onError,
      onProgress,
      onCompleted,
      onPreprocess,
    });

    this._sentEvent({ result, deviceType, eventKey: 'TRANSFER_FILES' });

    return result;
  };

  /**
   * description: fetch the data for generating bug/error reports
   *
   * @param {string} deviceType
   * @return {Promise<{data: string|null, error: string|null, stderr: string|null}>}
   */
  async fetchDebugReport({ deviceType }) {
    checkIf(deviceType, 'string');

    const result = await this.repository.fetchDebugReport({ deviceType });

    this._sentEvent({ result, deviceType, eventKey: 'FETCH_DEBUG_REPORT' });

    return result;
  }
}

const fileExplorerController = new FileExplorerController();

export default fileExplorerController;
