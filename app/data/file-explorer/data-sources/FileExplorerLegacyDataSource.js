import path from 'path';
import moment from 'moment';
import findLodash from 'lodash/find';
import { log } from '../../../utils/log';
import { splitIntoLines, undefinedOrNull } from '../../../utils/funcs';
import { DEVICES_LABEL } from '../../../constants';
import { DEVICE_TYPE } from '../../../enums';
import { filterOutMtpLines, mtpCli, promisifiedExec } from '../../../utils/mtp';
import { getExtension } from '../../../utils/files';
import { escapeShellMtp } from '../../sys';

export class FileExplorerLegacyDataSource {
  /**
   * description - Fetch MTP storages
   *
   */ async listStorages() {
    try {
      const { data, error, stderr } = await promisifiedExec(
        `${mtpCli} "storage-list"`
      );

      if (error || stderr) {
        log.error(
          `${error} : ${stderr}`,
          `FileExplorerLegacyDataSource.listStorages -> storage-list error`,
          false
        );
        return { error, stderr, data: null };
      }

      const _storageList = splitIntoLines(data);

      const descMatchPattern = /description:(.*)/i;
      const storageIdMatchPattern = /([^\D]+)/;

      let storageList = {};
      _storageList
        .filter((a, index) => !filterOutMtpLines(a, index))
        .map((a, index) => {
          if (!a) {
            return null;
          }
          const _matchDesc = descMatchPattern.exec(a);
          const _matchedStorageIds = storageIdMatchPattern.exec(a);

          if (
            undefinedOrNull(_matchDesc) ||
            undefinedOrNull(_matchDesc[1]) ||
            undefinedOrNull(_matchedStorageIds) ||
            undefinedOrNull(_matchedStorageIds[1])
          ) {
            return null;
          }

          const matchDesc = _matchDesc[1].trim();
          const matchedStorageId = _matchedStorageIds[1].trim();
          storageList = {
            ...storageList,
            [matchedStorageId]: {
              name: matchDesc,
              selected: index === 0,
            },
          };

          return storageList;
        });

      if (undefinedOrNull(storageList) || storageList.length < 1) {
        return {
          error: `${DEVICES_LABEL[DEVICE_TYPE.mtp]} storage not accessible`,
          stderr: null,
          data: null,
        };
      }

      return { error: null, stderr: null, data: storageList };
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
   */
  async listFiles({ filePath, ignoreHidden, storageId }) {
    try {
      const mtpCmdChopIndex = {
        type: 2,
        dateAdded: 4,
        timeAdded: 5,
      };
      const response = [];
      const storageSelectCmd = `"storage ${storageId}"`;

      const {
        data: filePropsData,
        error: filePropsError,
        stderr: filePropsStderr,
      } = await promisifiedExec(
        `${mtpCli} ${storageSelectCmd} "lsext \\"${escapeShellMtp(
          filePath
        )}\\""`
      );

      if (filePropsError || filePropsStderr) {
        log.error(
          `${filePropsError} : ${filePropsStderr}`,
          `listFiles -> lsext error`
        );

        return { error: filePropsError, stderr: filePropsStderr, data: null };
      }

      let fileProps = splitIntoLines(filePropsData);

      fileProps = fileProps.filter((a, index) => !filterOutMtpLines(a, index));

      for (let i = 0; i < fileProps.length; i += 1) {
        const item = fileProps[i];
        const matchedProps = item.match(
          /^(.*?)\s+\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/g
        );

        if (matchedProps === null || matchedProps.length < 1) {
          continue; // eslint-disable-line no-continue
        }

        const _matchedProps = matchedProps[0];
        const itemSplit = item.split(_matchedProps);

        if (itemSplit === null || itemSplit.length < 2 || itemSplit[1] === '') {
          continue; // eslint-disable-line no-continue
        }
        const matchedFileName = itemSplit[1].replace(/^\s{2}|\s$/g, '');
        const filePropsList = _matchedProps.replace(/\s\s+/g, ' ').split(' ');

        // eslint-disable-next-line no-useless-escape
        if (ignoreHidden && /(^|\/)\.[^\/\.]/g.test(matchedFileName)) {
          continue; // eslint-disable-line no-continue
        }

        const fullPath = path.resolve(filePath, matchedFileName);
        const isFolder = filePropsList[mtpCmdChopIndex.type] === '3001';
        const dateTime = `${filePropsList[mtpCmdChopIndex.dateAdded]} ${
          filePropsList[mtpCmdChopIndex.timeAdded]
        }`;
        const extension = getExtension(fullPath, isFolder);

        // avoid duplicate values
        if (findLodash(response, { path: fullPath })) {
          continue; // eslint-disable-line no-continue
        }
        response.push({
          name: matchedFileName,
          path: fullPath,
          extension,
          size: null,
          isFolder,
          dateAdded: moment(dateTime).format('YYYY-MM-DD HH:mm:ss'),
        });
      }

      return { error: null, stderr: null, data: response };
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: null };
    }
  }

  /**
   * description - Rename a device file
   *
   */
  async renameFile({ filePath, newFilename, storageId }) {
    try {
      if (undefinedOrNull(filePath) || undefinedOrNull(newFilename)) {
        return { error: `No files selected.`, stderr: null, data: null };
      }

      const storageSelectCmd = `"storage ${storageId}"`;
      const escapedFilePath = `${escapeShellMtp(filePath)}`;
      const escapedNewFilename = `${escapeShellMtp(newFilename)}`;

      const { error, stderr } = await promisifiedExec(
        `${mtpCli} ${storageSelectCmd} "rename \\"${escapedFilePath}\\" \\"${escapedNewFilename}\\""`
      );

      if (error || stderr) {
        log.error(
          `${error} : ${stderr}`,
          `FileExplorerLegacyDataSource.renameFile -> rename error`
        );

        return { error, stderr, data: false };
      }

      return { error: null, stderr: null, data: true };
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Delete device files
   *
   */
  async deleteFiles({ fileList, storageId }) {
    try {
      if (!fileList || fileList.length < 1) {
        return { error: `No files selected.`, stderr: null, data: null };
      }

      const storageSelectCmd = `"storage ${storageId}"`;
      for (let i = 0; i < fileList.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const { error, stderr } = await promisifiedExec(
          `${mtpCli} ${storageSelectCmd} "rm \\"${escapeShellMtp(
            fileList[i]
          )}\\""`
        );

        if (error || stderr) {
          log.error(
            `${error} : ${stderr}`,
            `FileExplorerLegacyDataSource.deleteFiles -> rm error`
          );
          return { error, stderr, data: false };
        }
      }

      return { error: null, stderr: null, data: true };
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: false };
    }
  }
}
