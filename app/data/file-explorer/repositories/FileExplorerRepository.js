import { FileExplorerLegacyDataSource } from '../data-sources/FileExplorerLegacyDataSource';
import { FileExplorerLocalDataSource } from '../data-sources/FileExplorerLocalDataSource';
import { FileExplorerKalamDataSource } from '../data-sources/FileExplorerKalamDataSource';
import { DEVICE_TYPE, MTP_MODE } from '../../../enums';
import { checkIf } from '../../../utils/checkIf';

const selectedMtpMode = MTP_MODE.legacy;

export class FileExplorerRepository {
  constructor() {
    this.legacyMtpDataSource = new FileExplorerLegacyDataSource();
    this.localDataSource = new FileExplorerLocalDataSource();
    this.kalamyMtpDataSource = new FileExplorerKalamDataSource();
  }

  /**
   * description - Fetch storages
   *
   * @return {Promise<{data: object|boolean, error: string|null, stderr: string|null}>}
   */
  async listStorages({ deviceType }) {
    if (deviceType === DEVICE_TYPE.mtp) {
      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.listStorages();

        case MTP_MODE.kalam:
        default:
          break;
      }
    }
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

      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.listFiles({
            filePath,
            ignoreHidden,
            storageId,
          });

        case MTP_MODE.kalam:
        default:
          break;
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

      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.renameFile({
            filePath,
            newFilename,
            storageId,
          });

        case MTP_MODE.kalam:
        default:
          break;
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

      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.deleteFiles({
            fileList,
            storageId,
          });

        case MTP_MODE.kalam:
        default:
          break;
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

      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.makeDirectory({
            filePath,
            storageId,
          });

        case MTP_MODE.kalam:
        default:
          break;
      }
    }

    return this.localDataSource.makeDirectory({
      filePath,
    });
  }
}
