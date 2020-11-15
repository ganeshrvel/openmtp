import { FileExplorerRepository } from '../repositories/FileExplorerRepository';

export class FileExplorerController {
  constructor() {
    this.repository = new FileExplorerRepository();
  }

  /**
   * description - Fetch storages
   *
   * @param {{deviceType: (DEVICE_TYPE.mtp|DEVICE_TYPE.local)}} args - Arguments
   */
  getStorages({ deviceType }) {}
}
