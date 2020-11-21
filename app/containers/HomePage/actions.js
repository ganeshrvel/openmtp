import prefixer from '../../utils/reducerPrefixer';
import { throwAlert } from '../Alerts/actions';
import {
  processMtpBuffer,
  processLocalBuffer,
} from '../../utils/processBufferOutput';
import { asserts, isArraysEqual, undefinedOrNull } from '../../utils/funcs';
import { DEVICE_TYPE } from '../../enums';
import { log } from '../../utils/log';
import fileExplorerController from '../../data/file-explorer/controllers/FileExplorerController';
import kalamFfi from '../../../ffi/kalam/src/Kalam';

const prefix = '@@Home';
const actionTypesList = [
  'SET_FOCUSSED_FILE_EXPLORER_DEVICE_TYPE',
  'SET_CURRENT_BROWSE_PATH',
  'SET_SORTING_DIR_LISTS',
  'SET_SELECTED_DIR_LISTS',
  'LIST_DIRECTORY',
  'SET_MTP_ERRORS',
  'SET_MTP_STATUS',
  'CHANGE_MTP_STORAGE',
  'SET_FILE_TRANSFER_CLIPBOARD',
  'SET_FILE_TRANSFER_PROGRESS',
  'CLEAR_FILE_TRANSFER',
  'SET_FILES_DRAG',
  'CLEAR_FILES_DRAG',
];

export const actionTypes = prefixer(prefix, actionTypesList);

export function setFocussedFileExplorerDeviceType(data) {
  return {
    type: actionTypes.SET_FOCUSSED_FILE_EXPLORER_DEVICE_TYPE,
    payload: {
      ...data,
    },
  };
}

export function setSortingDirLists(data, deviceType) {
  return {
    type: actionTypes.SET_SORTING_DIR_LISTS,
    deviceType,
    payload: {
      ...data,
    },
  };
}

export function setSelectedDirLists(data, deviceType) {
  return {
    type: actionTypes.SET_SELECTED_DIR_LISTS,
    deviceType,
    payload: {
      ...data,
    },
  };
}

export function setCurrentBrowsePath(path, deviceType) {
  return {
    type: actionTypes.SET_CURRENT_BROWSE_PATH,
    deviceType,
    payload: path,
  };
}

function _listDirectory(data, deviceType, _) {
  return {
    type: actionTypes.LIST_DIRECTORY,
    deviceType,
    payload: {
      nodes: data ?? [],
      isLoaded: true,
    },
  };
}

export function getStorageId(state) {
  if (
    typeof Object.keys(state.mtpStoragesList).length === 'undefined' ||
    Object.keys(state.mtpStoragesList).length < 1
  ) {
    return null;
  }

  const { mtpStoragesList } = state;
  const mtpStoragesListKeys = Object.keys(mtpStoragesList);

  for (let i = 0; i < mtpStoragesListKeys.length; i += 1) {
    const itemKey = mtpStoragesListKeys[i];

    if (mtpStoragesList[itemKey].selected) {
      return itemKey;
    }
  }

  return null;
}

export function setMtpStorageOptions(
  { ...listDirArgs },
  deviceType,
  { ...deviceChangeCheck },
  getState
) {
  return async (dispatch) => {
    try {
      await kalamFfi.InitializeMtp();
      await kalamFfi.FetchStorages();

      setTimeout(() => {
        kalamFfi.FetchStorages();
      }, 10000);

      return;

      const { error, stderr, data } = await fileExplorerController.listStorages(
        {
          deviceType,
        }
      );

      dispatch(
        processMtpOutput({
          deviceType,
          error,
          stderr,
          data,
          callback: () => {
            let changeMtpIdsFlag = true;

            if (
              Object.keys(deviceChangeCheck).length > 0 &&
              deviceChangeCheck.changeMtpStorageIdsOnlyOnDeviceChange &&
              Object.keys(deviceChangeCheck.mtpStoragesList).length > 0 &&
              isArraysEqual(
                Object.keys(data),
                Object.keys(deviceChangeCheck.mtpStoragesList)
              )
            ) {
              changeMtpIdsFlag = false;
            }

            if (changeMtpIdsFlag) {
              dispatch(changeMtpStorage({ ...data }));
            }

            dispatch(listDirectory({ ...listDirArgs }, deviceType, getState));
          },
        })
      );
    } catch (e) {
      log.error(e);
    }
  };
}

export function changeMtpStorage({ ...data }) {
  return {
    type: actionTypes.CHANGE_MTP_STORAGE,
    payload: data,
  };
}

export function setMtpStatus(data) {
  return {
    type: actionTypes.SET_MTP_STATUS,
    payload: data,
  };
}

export function processMtpOutput({ deviceType, error, stderr, _, callback }) {
  return async (dispatch) => {
    try {
      const {
        status: mtpStatus,
        error: mtpError,
        throwAlert: mtpThrowAlert,
        logError: mtpLogError,
      } = await processMtpBuffer({ error, stderr });

      dispatch(setMtpStatus(mtpStatus));

      if (!mtpStatus) {
        dispatch(_listDirectory([], deviceType));
        dispatch(setSelectedDirLists({ selected: [] }, deviceType));
      }

      if (mtpError) {
        log.error(mtpError, 'processMtpOutput', mtpLogError);
        if (mtpThrowAlert) {
          dispatch(throwAlert({ message: mtpError.toString() }));
        }

        return false;
      }

      callback();
    } catch (e) {
      log.error(e);
    }
  };
}

export function processLocalOutput({ _, error, stderr, __, callback }) {
  return (dispatch) => {
    try {
      const {
        error: localError,
        throwAlert: localThrowAlert,
        logError: localLogError,
      } = processLocalBuffer({ error, stderr });

      if (localError) {
        log.error(localError, 'processLocalOutput', localLogError);

        if (localThrowAlert) {
          dispatch(throwAlert({ message: localError.toString() }));
        }

        return false;
      }

      callback();
    } catch (e) {
      log.error(e);
    }
  };
}

export function listDirectory({ ...args }, deviceType, getState) {
  asserts(
    !undefinedOrNull(getState),
    'listDirectory.getState should not be null or undefined'
  );

  try {
    switch (deviceType) {
      case DEVICE_TYPE.local:
        return async (dispatch) => {
          const { error, data } = await fileExplorerController.listFiles({
            deviceType,
            filePath: args.filePath,
            ignoreHidden: args.ignoreHidden,
            storageId: null,
          });

          if (error) {
            log.error(error, 'listDirectory -> listFiles');
            dispatch(
              throwAlert({ message: `Unable fetch data from the Local disk.` })
            );

            return;
          }

          dispatch(_listDirectory(data, deviceType), getState);
          dispatch(setCurrentBrowsePath(args.filePath, deviceType));
          dispatch(setSelectedDirLists({ selected: [] }, deviceType));
        };

      case DEVICE_TYPE.mtp:
        return async (dispatch) => {
          const storageId = getStorageId(getState().Home);

          const {
            error,
            stderr,
            data,
          } = await fileExplorerController.listFiles({
            deviceType,
            filePath: args.filePath,
            ignoreHidden: args.ignoreHidden,
            storageId,
          });

          dispatch(
            processMtpOutput({
              deviceType,
              error,
              stderr,
              data,
              callback: () => {
                dispatch(_listDirectory(data, deviceType), getState);
                dispatch(setSelectedDirLists({ selected: [] }, deviceType));
                dispatch(setCurrentBrowsePath(args.filePath, deviceType));
              },
            })
          );
        };

      default:
        break;
    }
  } catch (e) {
    log.error(e);
  }
}

export function reloadDirList(
  { ...args },
  deviceType,
  mtpStoragesList,
  getState
) {
  return (dispatch) => {
    switch (deviceType) {
      case DEVICE_TYPE.local:
        dispatch(listDirectory({ ...args }, deviceType, getState));
        break;

      case DEVICE_TYPE.mtp:
        dispatch(
          setMtpStorageOptions(
            { ...args },
            deviceType,
            { changeMtpStorageIdsOnlyOnDeviceChange: true, mtpStoragesList },
            getState
          )
        );
        break;

      default:
        break;
    }
  };
}

export function setFileTransferClipboard({ ...data }) {
  return {
    type: actionTypes.SET_FILE_TRANSFER_CLIPBOARD,
    payload: {
      ...data,
    },
  };
}

export function setFileTransferProgress({ ...data }) {
  return {
    type: actionTypes.SET_FILE_TRANSFER_PROGRESS,
    payload: {
      ...data,
    },
  };
}

export function clearFileTransfer() {
  return {
    type: actionTypes.CLEAR_FILE_TRANSFER,
  };
}

export function setFilesDrag({ ...data }) {
  return {
    type: actionTypes.SET_FILES_DRAG,
    payload: {
      ...data,
    },
  };
}

export function clearFilesDrag() {
  return {
    type: actionTypes.CLEAR_FILES_DRAG,
  };
}
