import { v6 as uuidv6 } from 'uuid';

import { identifierStorage } from './storageHelper';
import { isEmpty } from '../utils/funcs';

export function getMachineId() {
  try {
    const settings = identifierStorage.getItems(['machineId']);

    if (!settings?.machineId || isEmpty(settings?.machineId)) {
      const _machineId = uuidv6();

      identifierStorage.setItems({
        machineId: _machineId,
      });

      return _machineId;
    }

    return settings.machineId;
  } catch (e) {
    console.error(`Unable to find machineId. Error: ${e}`);
  }
}
