import { log } from '../../../utils/log';
import { splitIntoLines } from '../../../utils/funcs';
import { DEVICES_LABEL } from '../../../constants';
import { DEVICE_TYPE } from '../../../enums';
import { filterOutMtpLines, mtpCli, promisifiedExec } from '../../../utils/mtp';

export class FileExplorerLegacyDataSource {
  async getStorages() {
    try {
      const { data, error, stderr } = await promisifiedExec(
        `${mtpCli} "storage-list"`
      );

      if (error || stderr) {
        log.error(
          `${error} : ${stderr}`,
          `fetchMtpStorageOptions -> storage-list error`,
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
          const _matchedStorageId = storageIdMatchPattern.exec(a);

          if (
            typeof _matchDesc === 'undefined' ||
            _matchDesc === null ||
            typeof _matchDesc[1] === 'undefined' ||
            typeof _matchedStorageId === 'undefined' ||
            _matchedStorageId === null ||
            typeof _matchedStorageId[1] === 'undefined'
          ) {
            return null;
          }

          const matchDesc = _matchDesc[1].trim();
          const matchedStorageId = _matchedStorageId[1].trim();
          storageList = {
            ...storageList,
            [matchedStorageId]: {
              name: matchDesc,
              selected: index === 0,
            },
          };

          return storageList;
        });

      if (
        typeof storageList === 'undefined' ||
        storageList === null ||
        storageList.length < 1
      ) {
        return {
          error: `${DEVICES_LABEL[DEVICE_TYPE.mtp]} storage not accessible`,
          stderr: null,
          data: null,
        };
      }

      return { error: null, stderr: null, data: storageList };
    } catch (e) {
      log.error(e);
    }
  }
}
