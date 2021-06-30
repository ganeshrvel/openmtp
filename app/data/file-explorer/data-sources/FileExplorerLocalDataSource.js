import path from 'path';
import junk from 'junk';
import Promise from 'bluebird';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';
import { askForFoldersAccess, askForPhotosAccess } from 'node-mac-permissions';
import {
  readdir as fsReaddir,
  existsSync,
  statSync,
  lstatSync,
  rename as fsRename,
  readlink,
  realpathSync,
} from 'fs';
import findLodash from 'lodash/find';
import { log } from '../../../utils/log';
import { isArray, isEmpty, undefinedOrNull } from '../../../utils/funcs';
import { pathUp } from '../../../utils/files';
import { appDateFormat } from '../../../utils/date';
import { checkIf } from '../../../utils/checkIf';
import { PATHS } from '../../../constants/paths';

export class FileExplorerLocalDataSource {
  constructor() {
    this.readdir = Promise.promisify(fsReaddir);
  }

  /**
   * description - make directory helper
   *
   */
  async _mkdir({ filePath }) {
    try {
      return new Promise((resolve) => {
        mkdirp(filePath)
          .then((data) => {
            resolve({ data, stderr: null, error: null });

            return data;
          })
          .catch((error) => {
            resolve({ data: null, stderr: error, error });
          });
      });
    } catch (e) {
      log.error(e);
    }
  }

  /**
   * description - Rename file helper
   *
   */
  _rename({ filePath, newFilename }) {
    try {
      const parentDir = pathUp(filePath);
      const newFilePath = path.join(parentDir, newFilename);

      return new Promise((resolve) => {
        fsRename(filePath, newFilePath, (error) => {
          return resolve({
            data: null,
            stderr: error,
            error,
          });
        });
      });
    } catch (e) {
      log.error(e);

      return {
        data: null,
        stderr: null,
        error: e,
      };
    }
  }

  /**
   * description - Delete file helper
   *
   */
  _delete = (file) => {
    try {
      return new Promise((resolve) => {
        rimraf(file, {}, (error) => {
          resolve({
            data: null,
            stderr: error,
            error,
          });
        });
      });
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: false };
    }
  };

  /**
   * description - request the usage access of the protected directories in macos
   * @private
   *
   * @param filePath {string}
   * @return {Promise<boolean>}
   */
  _requestUsageAccess = async ({ filePath }) => {
    checkIf(filePath, 'string');

    const isGrantedString = 'authorized';

    let result;

    if (filePath.startsWith(PATHS.desktopDir)) {
      result = await askForFoldersAccess('desktop');
    } else if (filePath.startsWith(PATHS.downloadsDir)) {
      result = await askForFoldersAccess('downloads');
    } else if (filePath.startsWith(PATHS.documentsDir)) {
      result = await askForFoldersAccess('documents');
    } else if (filePath.startsWith(PATHS.picturesDir)) {
      result = await askForPhotosAccess();
    }

    if (undefinedOrNull(result)) {
      return true;
    }

    return result === isGrantedString;
  };

  /**
   *
   * description - returns file info needed for navigating through symlinks
   * @private
   *
   * @param fullPath
   * @returns {Promise<{isFolder: boolean, symlink: string|null}>}
   * @private
   */
  _getSymlinkInfo = async ({ fullPath }) => {
    const symlink = await new Promise((resolve) => {
      try {
        readlink(fullPath, (err, lnk) => {
          if (err) {
            return resolve(null);
          }

          if (!undefinedOrNull(lnk) && existsSync(lnk)) {
            return resolve(realpathSync(lnk));
          }

          return resolve(null);
        });
      } catch (e) {
        return resolve(null);
      }
    });

    const isFolder = lstatSync(symlink ?? fullPath).isDirectory();

    return {
      isFolder,
      symlink,
    };
  };

  /**
   * description - Fetch local files in the path
   *
   * @param filePath
   * @param ignoreHidden
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async listFiles({ filePath, ignoreHidden }) {
    try {
      const _accessGranted = await this._requestUsageAccess({ filePath });

      if (!_accessGranted) {
        return {
          data: null,
          error: 'Permission denied',
        };
      }

      const response = [];
      const { error, data } = await this.readdir(filePath, 'utf8')
        .then((res) => {
          return {
            data: res,
            error: null,
          };
        })
        .catch((e) => {
          return {
            data: null,
            error: e,
          };
        });

      if (error) {
        log.error(error, `FileExplorerLocalDataSource.listFiles`);

        return { error, data: null };
      }

      let files = data;

      files = data.filter(junk.not);
      if (ignoreHidden) {
        // eslint-disable-next-line no-useless-escape
        files = data.filter((item) => !/(^|\/)\.[^\/\.]/g.test(item));
      }

      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];

        const fullPath = path.resolve(filePath, file);

        // eslint-disable-next-line no-await-in-loop
        const { isFolder, symlink } = await this._getSymlinkInfo({
          fullPath,
        });

        if (!existsSync(fullPath)) {
          continue; // eslint-disable-line no-continue
        }

        const stat = statSync(fullPath);
        const extension = path.extname(fullPath);
        const { size, atime: dateTime } = stat;

        if (findLodash(response, { path: fullPath })) {
          continue; // eslint-disable-line no-continue
        }

        response.push({
          name: file,
          path: fullPath,
          extension,
          size,
          isFolder,
          dateAdded: appDateFormat(dateTime),
          symlink,
        });
      }

      return { error, data: response };
    } catch (e) {
      log.error(e);

      return { error: e, data: null };
    }
  }

  /**
   * description - Rename a local file
   *
   * @param filePath
   * @param newFilename
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async renameFile({ filePath, newFilename }) {
    try {
      if (undefinedOrNull(filePath) || undefinedOrNull(newFilename)) {
        return { error: `No files selected.`, stderr: null, data: null };
      }

      const _accessGranted = await this._requestUsageAccess({ filePath });

      if (!_accessGranted) {
        return {
          data: null,
          error: 'Permission denied',
        };
      }

      const { error } = await this._rename({ filePath, newFilename });

      if (error) {
        log.error(
          `${error}`,
          `FileExplorerLocalDataSource.renameFile -> mv error`
        );

        return { error, stderr: null, data: false };
      }

      return { error: null, stderr: null, data: true };
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Delete a local file
   *
   * @param fileList
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async deleteFiles({ fileList }) {
    try {
      if (!fileList || fileList.length < 1) {
        return { error: `No files selected.`, stderr: null, data: null };
      }

      for (let i = 0; i < fileList.length; i += 1) {
        const filePath = fileList[i];

        // eslint-disable-next-line no-await-in-loop
        const _accessGranted = await this._requestUsageAccess({ filePath });

        if (!_accessGranted) {
          return {
            data: null,
            error: 'Permission denied',
          };
        }

        // eslint-disable-next-line no-await-in-loop
        const { error } = await this._delete(filePath);

        if (error) {
          log.error(
            `${error}`,
            `FileExplorerLocalDataSource.deleteFiles -> rm error`
          );

          return { error, stderr: null, data: false };
        }
      }

      return { error: null, stderr: null, data: true };
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Create a local directory
   *
   * @param {string} filePath
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async makeDirectory({ filePath }) {
    try {
      if (undefinedOrNull(filePath)) {
        return { error: `Invalid path.`, stderr: null, data: null };
      }

      // eslint-disable-next-line no-await-in-loop
      const _accessGranted = await this._requestUsageAccess({
        filePath,
      });

      if (!_accessGranted) {
        return {
          data: null,
          error: 'Permission denied',
        };
      }

      const { error } = await this._mkdir({ filePath });

      if (error) {
        log.error(
          `${error}`,
          `FileExplorerLocalDataSource.makeDirectory -> mkdir error`
        );

        return { error, stderr: null, data: false };
      }

      return { error: null, stderr: null, data: true };
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Check if files exist in the local disk
   *
   * @param {[string]} fileList
   * @return {Promise<boolean>}
   */
  async filesExist({ fileList }) {
    try {
      if (!isArray(fileList)) {
        return false;
      }

      if (isEmpty(fileList)) {
        return false;
      }

      for (let i = 0; i < fileList.length; i += 1) {
        const item = fileList[i];
        const fullPath = path.resolve(item);

        // eslint-disable-next-line no-await-in-loop
        const _accessGranted = await this._requestUsageAccess({
          filePath: fullPath,
        });

        if (!_accessGranted) {
          return {
            data: null,
            error: 'Permission denied',
          };
        }

        // eslint-disable-next-line no-await-in-loop
        if (await existsSync(fullPath)) {
          return true;
        }
      }

      return false;
    } catch (e) {
      log.error(e);

      return false;
    }
  }
}
