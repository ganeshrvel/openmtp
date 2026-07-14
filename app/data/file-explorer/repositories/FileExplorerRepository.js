import { FileExplorerLocalDataSource } from '../data-sources/FileExplorerLocalDataSource';
import { FileExplorerKalamDataSource } from '../data-sources/FileExplorerKalamDataSource';
import { DEVICE_TYPE } from '../../../enums';
import { checkIf } from '../../../utils/checkIf';

export class FileExplorerRepository {
  constructor() {
    this.localDataSource = new FileExplorerLocalDataSource();
    this.kalamMtpDataSource = new FileExplorerKalamDataSource();
  }

  async initialize({ deviceType }) {
    checkIf(deviceType, 'string');

    if (deviceType === DEVICE_TYPE.mtp) {
      return this.kalamMtpDataSource.initialize();
    }

    throw `initialize for deviceType=DEVICE_TYPE.local is unimplemented`;
  }

  async dispose({ deviceType }) {
    checkIf(deviceType, 'string');

    if (deviceType === DEVICE_TYPE.mtp) {
      return this.kalamMtpDataSource.dispose();
    }

    throw `dispose for deviceType=DEVICE_TYPE.local is unimplemented`;
  }

  async listStorages({ deviceType }) {
    if (deviceType === DEVICE_TYPE.mtp) {
      return this.kalamMtpDataSource.listStorages();
    }

    throw `listStorages for deviceType=DEVICE_TYPE.local is unimplemented`;
  }

  async listFiles({ deviceType, filePath, ignoreHidden, storageId }) {
    if (deviceType === DEVICE_TYPE.mtp) {
      checkIf(storageId, 'number');

      return this.kalamMtpDataSource.listFiles({
        filePath,
        ignoreHidden,
        storageId,
      });
    }

    return this.localDataSource.listFiles({
      filePath,
      ignoreHidden,
    });
  }

  async renameFile({ deviceType, filePath, newFilename, storageId }) {
    if (deviceType === DEVICE_TYPE.mtp) {
      checkIf(storageId, 'number');

      return this.kalamMtpDataSource.renameFile({
        filePath,
        newFilename,
        storageId,
      });
    }

    return this.localDataSource.renameFile({
      filePath,
      newFilename,
    });
  }

  async deleteFiles({ deviceType, fileList, storageId }) {
    if (deviceType === DEVICE_TYPE.mtp) {
      checkIf(storageId, 'number');

      return this.kalamMtpDataSource.deleteFiles({
        fileList,
        storageId,
      });
    }

    return this.localDataSource.deleteFiles({
      fileList,
    });
  }

  async makeDirectory({ deviceType, filePath, storageId }) {
    if (deviceType === DEVICE_TYPE.mtp) {
      checkIf(storageId, 'number');

      return this.kalamMtpDataSource.makeDirectory({
        filePath,
        storageId,
      });
    }

    return this.localDataSource.makeDirectory({
      filePath,
    });
  }

  async filesExist({ deviceType, fileList, storageId }) {
    if (deviceType === DEVICE_TYPE.mtp) {
      checkIf(storageId, 'number');

      return this.kalamMtpDataSource.filesExist({
        fileList,
        storageId,
      });
    }

    return this.localDataSource.filesExist({
      fileList,
    });
  }

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
      checkIf(storageId, 'number');
      checkIf(onPreprocess, 'function');

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

    throw `transferFiles for deviceType=DEVICE_TYPE.local is unimplemented`;
  }

  async fetchDebugReport({ deviceType }) {
    if (deviceType === DEVICE_TYPE.mtp) {
      return this.kalamMtpDataSource.fetchDebugReport();
    }

    throw `fetchDebugReport for deviceType=DEVICE_TYPE.local is unimplemented`;
  }
}
