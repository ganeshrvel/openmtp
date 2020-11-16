import { FileExplorerRepository } from '../repositories/FileExplorerRepository';

class FileExplorerController {
  constructor() {
    this.repository = new FileExplorerRepository();
  }

  /**
   * description - Fetch storages
   *
   */
  async listStorages({ deviceType }) {
    return this.repository.listStorages({ deviceType });
  }

  /**
   * description - Fetch files in the path
   *
   */
  async listFiles({ deviceType, filePath, ignoreHidden, storageId }) {
    return this.repository.listFiles({
      deviceType,
      filePath,
      ignoreHidden,
      storageId,
    });
  }
}

const fileExplorerController = new FileExplorerController();

export default fileExplorerController;
