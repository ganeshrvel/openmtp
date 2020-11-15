import { FileExplorerLegacyDataSource } from '../data-sources/FileExplorerLegacyDataSource';
import { FileExplorerLocalDataSource } from '../data-sources/FileExplorerLocalDataSource';
import { FileExplorerKalamDataSource } from '../data-sources/FileExplorerKalamDataSource';

export class FileExplorerRepository {
  constructor() {
    this.legacyMtpDataSource = new FileExplorerLegacyDataSource();
    this.localMtpDataSource = new FileExplorerLocalDataSource();
    this.kalamyMtpDataSource = new FileExplorerKalamDataSource();
  }

  /**
   * description - Fetch storages
   *
   * @param {{deviceType: (DEVICE_TYPE.mtp|DEVICE_TYPE.local)}} args - Arguments
   */
  getStorages({ deviceType }) {}
}
