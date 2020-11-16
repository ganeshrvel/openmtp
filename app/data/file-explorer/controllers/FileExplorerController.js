import { FileExplorerRepository } from '../repositories/FileExplorerRepository';

class FileExplorerController {
  constructor() {
    this.repository = new FileExplorerRepository();
  }

  /**
   * description - Fetch storages
   *
   */
  getStorages({ deviceType }) {
    return this.repository.getStorages({ deviceType });
  }
}

const fileExplorerController = new FileExplorerController();

export default fileExplorerController;
