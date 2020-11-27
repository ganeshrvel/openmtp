import { log } from '../../../utils/log';
import { Kalam } from '../../../../ffi/kalam/src/Kalam';
import { checkIf } from '../../../utils/checkIf';

export class FileExplorerKalamDataSource {
  constructor() {
    this.kalamFfi = new Kalam();
  }

  /**
   * description - Initialize Kalam MTP
   *
   * @return {Promise<{data: object, error: string|null, stderr: string|null}>}
   */
  async initialize() {
    try {
      return this.kalamFfi.initialize();
    } catch (e) {
      log.error(e);

      return {
        error: e,
        stderr: null,
        data: null,
      };
    }
  }

  /**
   * description - Fetch Kalam MTP storages
   *
   * @return {Promise<{data: {}, error: string|null, stderr: string|null}>}
   */
  async listStorages() {
    try {
      const { error, stderr, data } = await this.kalamFfi.listStorages();

      if (error || stderr || !data) {
        return { error, stderr, data };
      }

      const storageList = {};

      data.forEach((a, index) => {
        storageList[`${a.Sid}`] = {
          name: a.Info.StorageDescription,
          selected: index === 0,
          info: a.Info,
        };
      });

      return { error, stderr, data: storageList };
    } catch (e) {
      log.error(e);

      return {
        error: e,
        stderr: null,
        data: null,
      };
    }
  }

  /**
   * description - Fetch device files in the path
   *
   * @param filePath
   * @param ignoreHidden
   * @param storageId
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async listFiles({ filePath, ignoreHidden, storageId }) {
    checkIf(filePath, 'string');
    checkIf(ignoreHidden, 'boolean');
    checkIf(storageId, 'string');

    try {
      return this.kalamFfi.walk({ fullPath: filePath, storageId });
    } catch (e) {
      log.error(e);

      return {
        error: e,
        stderr: null,
        data: null,
      };
    }
  }
}
