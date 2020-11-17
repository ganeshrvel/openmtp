import { FileExplorerRepository } from '../repositories/FileExplorerRepository';
import { checkIf } from '../../../utils/checkIf';

class FileExplorerController {
  constructor() {
    this.repository = new FileExplorerRepository();
  }

  /**
   * description - Fetch storages
   *
   */
  async listStorages({ deviceType }) {
    checkIf(deviceType, 'string');

    return this.repository.listStorages({ deviceType });
  }

  /**
   * description - Fetch files in the path
   *
   */
  async listFiles({ deviceType, filePath, ignoreHidden, storageId }) {
    checkIf(deviceType, 'string');
    checkIf(filePath, 'string');
    checkIf(ignoreHidden, 'boolean');

    return this.repository.listFiles({
      deviceType,
      filePath,
      ignoreHidden,
      storageId,
    });
  }

  /**
   * description - Rename file
   *
   */
  async renameFile({ deviceType, filePath, newFilename, storageId }) {
    checkIf(deviceType, 'string');
    checkIf(filePath, 'string');
    checkIf(newFilename, 'string');

    return this.repository.renameFile({
      deviceType,
      filePath,
      newFilename,
      storageId,
    });
  }

  /**
   * description - Delete files
   *
   */
  async deleteFiles({ deviceType, fileList, storageId }) {
    checkIf(deviceType, 'string');
    checkIf(fileList, 'array');

    return this.repository.deleteFiles({
      deviceType,
      fileList,
      storageId,
    });
  }
}

const fileExplorerController = new FileExplorerController();

export default fileExplorerController;
