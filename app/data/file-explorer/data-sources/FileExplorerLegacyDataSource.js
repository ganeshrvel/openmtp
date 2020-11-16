import { log } from '../../../utils/log';
import { splitIntoLines, undefinedOrNull } from '../../../utils/funcs';
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
    }
  }
}
