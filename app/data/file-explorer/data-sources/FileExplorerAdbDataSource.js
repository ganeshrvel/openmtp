import path from 'path';
import { AdbTransport, ANDROID_STORAGE_ROOT } from '../../adb/AdbTransport';
import { log } from '../../../utils/log';

/** Adapter from the file explorer's established result/callback API to ADB. */
export class FileExplorerAdbDataSource {
  constructor({ transport = new AdbTransport() } = {}) {
    this.transport = transport;
  }

  async initialize({ serial } = {}) {
    const discovered = await this.transport.discover();
    const devices = discovered.data.filter(
      (device) => device.state === 'device'
    );

    if (serial) this.transport.serial = serial;
    else if (devices.length === 1) this.transport.serial = devices[0].serial;
    else if (devices.length > 1)
      return {
        error: 'Multiple ADB devices detected. Select a device.',
        stderr: null,
        data: null,
      };
    else
      return {
        error: discovered.error || 'No ADB devices found',
        stderr: null,
        data: null,
      };

    return {
      error: null,
      stderr: null,
      data: { serial: this.transport.serial, root: ANDROID_STORAGE_ROOT },
    };
  }

  async dispose() {
    return this.transport.disconnect();
  }

  async listStorages() {
    return {
      error: null,
      stderr: null,
      data: {
        adb: {
          name: 'Internal Storage',
          selected: true,
          info: { root: ANDROID_STORAGE_ROOT },
        },
      },
    };
  }

  async listFiles({ filePath, ignoreHidden }) {
    return this.transport.list(filePath, ignoreHidden);
  }

  async renameFile({ filePath, newFilename }) {
    return this.transport.rename(
      filePath,
      path.posix.join(path.posix.dirname(filePath), newFilename)
    );
  }

  async deleteFiles({ fileList }) {
    for (let index = 0; index < fileList.length; index += 1) {
      // eslint-disable-next-line no-await-in-loop
      const result = await this.transport.delete(fileList[index]);

      if (result.error) return result;
    }

    return { error: null, stderr: null, data: true };
  }

  async makeDirectory({ filePath }) {
    return this.transport.mkdir(filePath);
  }

  async filesExist({ fileList }) {
    for (let index = 0; index < fileList.length; index += 1) {
      const parent = path.posix.dirname(fileList[index]);
      // eslint-disable-next-line no-await-in-loop
      const result = await this.transport.list(parent, false);

      if (
        result.error ||
        result.data.some((item) => item.path === fileList[index])
      )
        return true;
    }

    return false;
  }

  transferFiles({
    destination,
    fileList,
    direction,
    onError,
    onProgress,
    onCompleted,
    onPreprocess,
  }) {
    try {
      onPreprocess({ totalFiles: fileList.length });

      return this.transport.transfer({
        sources: fileList,
        destination,
        direction,
        onError,
        onProgress,
        onCompleted,
      });
    } catch (error) {
      log.error(error, 'FileExplorerAdbDataSource.transferFiles');
      onError({ error, stderr: null, data: null });

      return null;
    }
  }

  cancel(operationId) {
    return this.transport.cancel(operationId);
  }
}
