import prefixer from '../../utils/reducerPrefixer';
import { throwAlert } from '../Alerts/actions';
import {
  processMtpBuffer,
  processLocalBuffer,
} from '../../utils/processBufferOutput';
import { isArraysEqual } from '../../utils/funcs';
import { DEVICE_TYPE } from '../../enums';
import { log } from '../../utils/log';
import fileExplorerController from '../../data/file-explorer/controllers/FileExplorerController';
import { checkIf } from '../../utils/checkIf';

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
  {
    filePath,
    ignoreHidden,
    deviceType,
    mtpStoragesList,
    mtpMode,
    changeMtpStorageIdsOnlyOnDeviceChange,
  },
  getState
) {
  checkIf(filePath, 'string');
  checkIf(ignoreHidden, 'boolean');
  checkIf(deviceType, 'string');
  checkIf(mtpStoragesList, 'object');
  checkIf(mtpMode, 'string');
  checkIf(changeMtpStorageIdsOnlyOnDeviceChange, 'boolean');
  checkIf(getState, 'function');

  return (dispatch) => {
    try {
      // await kalamFfi.InitializeMtp();
      // await kalamFfi.FetchDeviceInfo();
      // const { data: storagesData } = await kalamFfi.FetchStorages();
      // const { data: mkDirData1 } = await kalamFfi.MakeDirectory({
      //   storageId: storagesData[0].Sid.toString(),
      //   fullPath: '/test2',
      // });
      // const { data: mkDirData2 } = await kalamFfi.MakeDirectory({
      //   storageId: storagesData[0].Sid.toString(),
      //   fullPath: '/TEST1',
      // });
      //
      // const { data: renameFileData } = await kalamFfi.RenameFile({
      //   storageId: storagesData[0].Sid.toString(),
      //   fullPath: '/TEST1',
      //   newFileName: '/test1',
      // });
      //
      // const { data: fileExistsData } = await kalamFfi.FileExists({
      //   storageId: storagesData[0].Sid.toString(),
      //   files: ['/test1', '/test2'],
      // });
      //
      // const { data: deleteFileData } = await kalamFfi.DeleteFile({
      //   storageId: storagesData[0].Sid.toString(),
      //   files: ['/TEST2', '/TEST1'],
      // });
      //
      // const { data: fileExistsData2 } = await kalamFfi.FileExists({
      //   storageId: storagesData[0].Sid.toString(),
      //   files: ['/TEST1', '/TEST2'],
      // });
      // const { data: WalkData } = await kalamFfi.Walk({
      //   storageId: storagesData[0].Sid.toString(),
      //   fullPath: '/',
      // });
      //
      // const tempDataPath = path.resolve(
      //   path.join('./mtp-mock-files', 'mtp-test-files', 'test-large-file')
      // );
      // const {
      //   data: UploadFilesData,
      // } = await kalamFfi.UploadFiles({
      //   storageId: storagesData[0].Sid.toString(),
      //   sources: [tempDataPath],
      //   destination: '/mtp-test-files/temp_dir',
      //   preprocessFiles: true, //todo
      // });
      // const { data: downloadFilesData } = await kalamFfi.DownloadFiles({
      //   storageId: storagesData[0].Sid.toString(),
      //   sources: ['/mtp-test-files/test-large-file'],
      //   destination: tempDataPath,
      //   preprocessFiles: true, //todo
      // });
      // await kalamFfi.Dispose();
      // if(mode==legacy){
      //   setLegacyMtpStorageOptions()
      // }

      return dispatch(
        setLegacyMtpStorageOptions(
          {
            filePath,
            ignoreHidden,
            deviceType,
            mtpStoragesList,
            changeMtpStorageIdsOnlyOnDeviceChange,
          },
          getState
        )
      );
    } catch (e) {
      log.error(e);
    }
  };
}

function setLegacyMtpStorageOptions(
  {
    filePath,
    ignoreHidden,
    deviceType,
    mtpStoragesList,
    changeMtpStorageIdsOnlyOnDeviceChange,
  },
  getState
) {
  return async (dispatch) => {
    checkIf(filePath, 'string');
    checkIf(ignoreHidden, 'boolean');
    checkIf(deviceType, 'string');
    checkIf(mtpStoragesList, 'object');
    checkIf(changeMtpStorageIdsOnlyOnDeviceChange, 'boolean');

    try {
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
              changeMtpStorageIdsOnlyOnDeviceChange &&
              Object.keys(mtpStoragesList).length > 0 &&
              isArraysEqual(Object.keys(data), Object.keys(mtpStoragesList))
            ) {
              changeMtpIdsFlag = false;
            }

            if (changeMtpIdsFlag) {
              dispatch(changeMtpStorage({ ...data }));
            }

            dispatch(
              listDirectory(
                {
                  filePath,
                  ignoreHidden,
                },
                deviceType,
                getState
              )
            );
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
  checkIf(getState, 'function');

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
  { filePath, ignoreHidden, deviceType, mtpStoragesList, mtpMode },
  getState
) {
  return (dispatch) => {
    switch (deviceType) {
      case DEVICE_TYPE.local:
        dispatch(
          listDirectory({ filePath, ignoreHidden }, deviceType, getState)
        );
        break;

      case DEVICE_TYPE.mtp:
        dispatch(
          setMtpStorageOptions(
            {
              filePath,
              ignoreHidden,
              deviceType,
              mtpStoragesList,
              mtpMode,
              changeMtpStorageIdsOnlyOnDeviceChange: true,
            },
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
