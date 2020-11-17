import path from 'path';
import junk from 'junk';
import Promise from 'bluebird';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';
import {
  readdir as fsReaddir,
  existsSync,
  statSync,
  lstatSync,
  rename as fsRename,
} from 'fs';
import moment from 'moment';
import findLodash from 'lodash/find';
import { log } from '../../../utils/log';
import { undefinedOrNull } from '../../../utils/funcs';
import { pathUp } from '../../../utils/files';

export class FileExplorerLocalDataSource {
  constructor() {
    this.readdir = Promise.promisify(fsReaddir);
  }

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
   * description - Fetch local files in the path
   *
   * @param filePath
   * @param ignoreHidden
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async listFiles({ filePath, ignoreHidden }) {
    try {
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
        return { error: true, data: null };
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

        if (!existsSync(fullPath)) {
          continue; // eslint-disable-line no-continue
        }
        const stat = statSync(fullPath);
        const isFolder = lstatSync(fullPath).isDirectory();
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
          dateAdded: moment(dateTime).format('YYYY-MM-DD HH:mm:ss'),
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
        const item = fileList[i];
        // eslint-disable-next-line no-await-in-loop
        const { error } = await this._delete(item);
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
}
