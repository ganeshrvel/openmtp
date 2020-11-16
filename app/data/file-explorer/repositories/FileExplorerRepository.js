import { FileExplorerLegacyDataSource } from '../data-sources/FileExplorerLegacyDataSource';
import { FileExplorerLocalDataSource } from '../data-sources/FileExplorerLocalDataSource';
import { FileExplorerKalamDataSource } from '../data-sources/FileExplorerKalamDataSource';
import { DEVICE_TYPE } from '../../../enums';

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
  getStorages({ deviceType }) {
    if (deviceType === DEVICE_TYPE.mtp) {
      return this.legacyMtpDataSource.getStorages();
    }
  }
}
