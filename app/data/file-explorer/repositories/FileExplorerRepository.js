import { FileExplorerLegacyDataSource } from '../data-sources/FileExplorerLegacyDataSource';
import { FileExplorerLocalDataSource } from '../data-sources/FileExplorerLocalDataSource';
import { FileExplorerKalamDataSource } from '../data-sources/FileExplorerKalamDataSource';
import { DEVICE_TYPE, MTP_MODE } from '../../../enums';
import { checkIf } from '../../../utils/checkIf';
import { getMtpModeSetting } from '../../../helpers/settings';

export class FileExplorerRepository {
  constructor() {
    this.legacyMtpDataSource = new FileExplorerLegacyDataSource();
    this.localDataSource = new FileExplorerLocalDataSource();
    this.kalamMtpDataSource = new FileExplorerKalamDataSource();
  }

  /**
   * description - Initialize
   *
   * @return {Promise<{data: object, error: string|null, stderr: string|null}>}
   */
  async initialize({ deviceType }) {
    const selectedMtpMode = getMtpModeSetting();

    checkIf(deviceType, 'string');

    if (deviceType === DEVICE_TYPE.mtp) {
      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          throw `initialize for MTP_MODE.legacy is unimplemented`;

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.initialize();
      }
    }

    throw `initialize for deviceType=DEVICE_TYPE.local is unimplemented`;
  }

  /**
   * description - Dispose
   *
   * @return {Promise<{data: object, error: string|null, stderr: string|null}>}
   */
  async dispose({ deviceType }) {
    checkIf(deviceType, 'string');

    const selectedMtpMode = getMtpModeSetting();

    if (deviceType === DEVICE_TYPE.mtp) {
      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          throw `dispose for MTP_MODE.legacy is unimplemented`;

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.dispose();
      }
    }

    throw `dispose for deviceType=DEVICE_TYPE.local is unimplemented`;
  }

  /**
   * description - Fetch storages
   *
   * @return {Promise<{data: object|boolean, error: string|null, stderr: string|null}>}
   */
  async listStorages({ deviceType }) {
    const selectedMtpMode = getMtpModeSetting();

    if (deviceType === DEVICE_TYPE.mtp) {
      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.listStorages();

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.listStorages();
      }
    }

    throw `listStorages for deviceType=DEVICE_TYPE.local is unimplemented`;
  }

  /**
   * description - Fetch files in the path
   *
   * @param deviceType
   * @param filePath
   * @param ignoreHidden
   * @param storageId
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async listFiles({ deviceType, filePath, ignoreHidden, storageId }) {
    if (deviceType === DEVICE_TYPE.mtp) {
      checkIf(storageId, 'numericString');

      const selectedMtpMode = getMtpModeSetting();

      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.listFiles({
            filePath,
            ignoreHidden,
            storageId,
          });

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.listFiles({
            filePath,
            ignoreHidden,
            storageId,
          });
      }
    }

    return this.localDataSource.listFiles({
      filePath,
      ignoreHidden,
    });
  }

  /**
   * description - Rename a file
   *
   * @param deviceType
   * @param filePath
   * @param newFilename
   * @param storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async renameFile({ deviceType, filePath, newFilename, storageId }) {
    if (deviceType === DEVICE_TYPE.mtp) {
      checkIf(storageId, 'numericString');

      const selectedMtpMode = getMtpModeSetting();

      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.renameFile({
            filePath,
            newFilename,
            storageId,
          });

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.renameFile({
            filePath,
            newFilename,
            storageId,
          });
      }
    }

    return this.localDataSource.renameFile({
      filePath,
      newFilename,
    });
  }

  /**
   * description - Delete files
   *
   * @param deviceType
   * @param fileList
   * @param storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async deleteFiles({ deviceType, fileList, storageId }) {
    if (deviceType === DEVICE_TYPE.mtp) {
      checkIf(storageId, 'numericString');

      const selectedMtpMode = getMtpModeSetting();

      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.deleteFiles({
            fileList,
            storageId,
          });

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.deleteFiles({
            fileList,
            storageId,
          });
      }
    }

    return this.localDataSource.deleteFiles({
      fileList,
    });
  }

  /**
   * description - Create a directory
   *
   * @param deviceType
   * @param filePath
   * @param storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async makeDirectory({ deviceType, filePath, storageId }) {
    if (deviceType === DEVICE_TYPE.mtp) {
      checkIf(storageId, 'numericString');

      const selectedMtpMode = getMtpModeSetting();

      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.makeDirectory({
            filePath,
            storageId,
          });

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.makeDirectory({
            filePath,
            storageId,
          });
      }
    }

    return this.localDataSource.makeDirectory({
      filePath,
    });
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
    if (deviceType === DEVICE_TYPE.mtp) {
      checkIf(storageId, 'numericString');

      const selectedMtpMode = getMtpModeSetting();

      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.filesExist({
            fileList,
            storageId,
          });

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.filesExist({
            fileList,
            storageId,
          });
      }
    }

    return this.localDataSource.filesExist({
      fileList,
    });
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
   * @param {progressCallback} onProgress
   * @param {preprocessCallback} onPreprocess
   * @param {completedCallback} onCompleted
   *
   * @return
   */
  transferFiles({
    deviceType,
    destination,
    fileList,
    direction,
    storageId,
    onError,
    onPreprocess,
    onProgress,
    onCompleted,
  }) {
    if (deviceType === DEVICE_TYPE.mtp) {
      checkIf(storageId, 'numericString');
      checkIf(onPreprocess, 'function');

      const selectedMtpMode = getMtpModeSetting();

      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.transferFiles({
            destination,
            fileList,
            direction,
            storageId,
            onError,
            onProgress,
            onCompleted,
            onPreprocess,
          });

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.transferFiles({
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
      }
    }

    // eslint-disable-next-line no-throw-literal
    throw `transferFiles for deviceType=DEVICE_TYPE.local is unimplemented`;
  }

  /**
   * description: fetch the data for generating bug/error reports
   *
   * @param {string} deviceType
   * @return {Promise<{data: string|null, error: string|null, stderr: string|null}>}
   */
  async fetchDebugReport({ deviceType }) {
    const selectedMtpMode = getMtpModeSetting();

    if (deviceType === DEVICE_TYPE.mtp) {
      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.fetchDebugReport();

        case MTP_MODE.kalam:
        default:
          return;
      }
    }

    // eslint-disable-next-line no-throw-literal
    throw `fetchDebugReport for deviceType=DEVICE_TYPE.local is unimplemented`;
  }
}
