import path from 'path';
import junk from 'junk';
import Promise from 'bluebird';
import { readdir as fsReaddir, existsSync, statSync, lstatSync } from 'fs';
import moment from 'moment';
import findLodash from 'lodash/find';
import { log } from '../../../utils/log';

export class FileExplorerLocalDataSource {
  constructor() {
    this.readdir = Promise.promisify(fsReaddir);
  }

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
        log.error(error, `listFiles`);
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

      return { error: true, data: null };
    }
  }
}
