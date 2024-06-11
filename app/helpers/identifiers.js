import { machineId } from 'node-machine-id';
import { settingsStorage } from './storageHelper';

export async function getMachineId() {
  const settings = settingsStorage.getItems(['machineId']);

  if (!settings?.machineId) {
    const _machineId = await machineId();

    settingsStorage.setItems({
      machineId: _machineId,
    });

    return _machineId;
  }

  return settings.machineId;
}
