import prefixer from '../../utils/reducerPrefixer';
import { throwAlert } from '../Alerts/actions';
import {
  processMtpBuffer,
  processLocalBuffer,
} from '../../utils/processBufferOutput';
import { isArraysEqual, isEmpty } from '../../utils/funcs';
import { DEVICE_TYPE, MTP_MODE } from '../../enums';
import { log } from '../../utils/log';
import fileExplorerController from '../../data/file-explorer/controllers/FileExplorerController';
import { checkIf } from '../../utils/checkIf';
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

export function initializeMtp(
  { filePath, ignoreHidden, changeMtpStorageIdsOnlyOnDeviceChange, deviceType },
  getState
) {
  checkIf(deviceType, 'string');
  checkIf(filePath, 'string');
  checkIf(ignoreHidden, 'boolean');
  checkIf(changeMtpStorageIdsOnlyOnDeviceChange, 'boolean');
  checkIf(getState, 'function');

  const { mtpStoragesList } = getState().Home;
  const { mtpMode } = getState().Settings;

  return async (dispatch) => {
    try {
      // await kalamFfi.InitializeMtp();
      // await kalamFfi.FetchDeviceInfo();
      // // const { data: storagesData } = await kalamFfi.FetchStorages();
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
      //   initLegacyMtp()
      // }

      switch (mtpMode) {
        case MTP_MODE.kalam:
          return dispatch(
            initKalamMtp(
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

        case MTP_MODE.legacy:
          return dispatch(
            initLegacyMtp(
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

        default:
          throw `invalid value for  'mtpMode'`;
      }
    } catch (e) {
      log.error(e);
    }
  };
}

function initKalamMtp(
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
      const { mtpMode } = getState().Settings;
      //todo move
      const { error, stderr, data } = await kalamFfi.InitializeMtp();

      const { error: initializeError } = await new Promise((resolve) => {
        dispatch(
          churnMtpBuffer({
            deviceType,
            error,
            stderr,
            data,
            mtpMode,
            onSuccess: () => {
              //todo set device info
              return resolve({
                error: null,
                stderr: null,
                data,
              });
            },
            onError: () => {
              return resolve({
                error,
                stderr,
                data: null,
              });
            },
          })
        );
      });

      const {
        data: storagesData,
        error: _error,
        stderr: _stderr,
      } = await kalamFfi.FetchStorages();

      if (initializeError) {
        return;
      }

      const {
        stderr: listStoragesStderr,
        error: listStoragesError,
      } = await listKalamStorages(
        {
          filePath,
          ignoreHidden,
          deviceType,
          mtpStoragesList,
          changeMtpStorageIdsOnlyOnDeviceChange,
        },
        getState
      );
    } catch (e) {
      log.error(e);
    }
  };
}

function listKalamStorages(
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
      const { mtpMode } = getState().Settings;

      const { error, stderr, data } = await fileExplorerController.listStorages(
        {
          deviceType,
        }
      );

      return new Promise((resolve) => {
        dispatch(
          churnMtpBuffer({
            deviceType,
            error,
            stderr,
            data,
            mtpMode,
            onSuccess: async () => {
              dispatch(changeMtpStorage({ ...data }));

              return resolve({
                error: null,
                stderr: null,
                data,
              });
            },
            onError: async () => {
              return resolve({
                error,
                stderr,
                data: null,
              });
            },
          })
        );
      });
    } catch (e) {
      log.error(e);
    }
  };
}

function initLegacyMtp(
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

    const { mtpMode } = getState().Settings;

    try {
      const { error, stderr, data } = await fileExplorerController.listStorages(
        {
          deviceType,
        }
      );

      dispatch(
        churnMtpBuffer({
          deviceType,
          error,
          stderr,
          data,
          mtpMode,
          onSuccess: () => {
            let updateMtpStorage = true;

            if (
              changeMtpStorageIdsOnlyOnDeviceChange &&
              !isEmpty(mtpStoragesList) &&
              isArraysEqual(Object.keys(data), Object.keys(mtpStoragesList))
            ) {
              updateMtpStorage = false;
            }

            if (updateMtpStorage) {
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

// This is the main entry point of data received from the MTP kernel.
// The data received here undergoes processing and the neccessary actions are taken accordingly
export function churnMtpBuffer({
  deviceType,
  error,
  stderr,
  _,
  mtpMode,
  onSuccess,
  onError,
}) {
  checkIf(onSuccess, 'function');
  checkIf(mtpMode, 'string');

  return async (dispatch) => {
    try {
      const {
        mtpStatus,
        error: mtpError,
        throwAlert: mtpThrowAlert,
        logError: mtpLogError,
      } = await processMtpBuffer({ error, stderr, mtpMode });

      dispatch(setMtpStatus(mtpStatus));

      if (!mtpStatus) {
        dispatch(_listDirectory([], deviceType));
        dispatch(setSelectedDirLists({ selected: [] }, deviceType));
      }

      if (mtpError) {
        log.error(mtpError, 'churnMtpBuffer', mtpLogError);
        if (mtpThrowAlert) {
          dispatch(throwAlert({ message: mtpError.toString() }));
        }

        if (onError) {
          return onError();
        }

        return;
      }

      return onSuccess();
    } catch (e) {
      log.error(e);
    }
  };
}

// this is the main entry point of data received from the local disk file actions.
// the data received here undergoes processing and the neccessary actions are taken accordingly
export function churnLocalBuffer({ _, error, stderr, __, onSuccess }) {
  checkIf(onSuccess, 'function');

  return (dispatch) => {
    try {
      const {
        error: localError,
        throwAlert: localThrowAlert,
        logError: localLogError,
      } = processLocalBuffer({ error, stderr });

      if (localError) {
        log.error(localError, 'churnLocalBuffer', localLogError);

        if (localThrowAlert) {
          dispatch(throwAlert({ message: localError.toString() }));
        }

        return false;
      }

      onSuccess();
    } catch (e) {
      log.error(e);
    }
  };
}

export function listDirectory({ ...args }, deviceType, getState) {
  checkIf(getState, 'function');

  const { mtpMode } = getState().Settings;

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
            churnMtpBuffer({
              deviceType,
              error,
              stderr,
              data,
              mtpMode,
              onSuccess: () => {
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
  { filePath, ignoreHidden, deviceType },
  getState
) {
  checkIf(deviceType, 'string');
  checkIf(filePath, 'string');
  checkIf(ignoreHidden, 'boolean');
  checkIf(getState, 'function');

  const { mtpMode } = getState().Home;

  return (dispatch) => {
    switch (deviceType) {
      case DEVICE_TYPE.local:
        return dispatch(
          listDirectory({ filePath, ignoreHidden }, deviceType, getState)
        );

      case DEVICE_TYPE.mtp:
        switch (mtpMode) {
          case MTP_MODE.legacy:
            return dispatch(
              initializeMtp(
                {
                  filePath,
                  ignoreHidden,
                  changeMtpStorageIdsOnlyOnDeviceChange: true,
                  deviceType,
                },
                getState
              )
            );

          case MTP_MODE.kalam:
          default:
            //todo list directory
            return;
        }

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
