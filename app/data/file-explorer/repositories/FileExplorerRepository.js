import { FileExplorerLegacyDataSource } from '../data-sources/FileExplorerLegacyDataSource';
import { FileExplorerLocalDataSource } from '../data-sources/FileExplorerLocalDataSource';
import { FileExplorerKalamDataSource } from '../data-sources/FileExplorerKalamDataSource';
import { DEVICE_TYPE, MTP_MODE } from '../../../enums';

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
   */
  async listFiles({ deviceType, filePath, ignoreHidden, storageId }) {
    if (deviceType === DEVICE_TYPE.mtp) {
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
   * description - Rename file
   *
   */
  async renameFile({ deviceType, filePath, newFilename, storageId }) {
    if (deviceType === DEVICE_TYPE.mtp) {
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
   */
  async deleteFiles({ deviceType, fileList, storageId }) {
    if (deviceType === DEVICE_TYPE.mtp) {
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
}
