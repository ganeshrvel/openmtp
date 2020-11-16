import { FileExplorerRepository } from '../repositories/FileExplorerRepository';
import { DEVICE_TYPE, MTP_MODE } from '../../../enums';
import { isArray } from '../../../utils/funcs';

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

  /**
   * description - Rename file
   *
   */
  async renameFile({ deviceType, filePath, newFilename, storageId }) {
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
    if (!isArray(fileList)) {
      // eslint-disable-next-line no-throw-literal
      throw `'fileList' must be an array`;
    }

    return this.repository.deleteFiles({
      deviceType,
      fileList,
      storageId,
    });
  }
}

const fileExplorerController = new FileExplorerController();

export default fileExplorerController;
