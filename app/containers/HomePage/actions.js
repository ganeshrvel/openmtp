import prefixer from '../../helpers/reducerPrefixer';
import { throwAlert } from '../Alerts/actions';
import {
  processMtpBuffer,
  processLocalBuffer,
} from '../../helpers/processBufferOutput';
import { isArraysEqual, isEmpty, undefinedOrNull } from '../../utils/funcs';
import { DEVICE_TYPE, MTP_MODE } from '../../enums';
import { log } from '../../utils/log';
import fileExplorerController from '../../data/file-explorer/controllers/FileExplorerController';
import { checkIf } from '../../utils/checkIf';
import { MTP_ERROR } from '../../enums/mtpError';
import { DEVICES_DEFAULT_PATH } from '../../constants';

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

export function actionSetSelectedDirLists(data, deviceType) {
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

function actionListDirectory(data, deviceType, _) {
  return {
    type: actionTypes.LIST_DIRECTORY,
    deviceType,
    payload: {
      nodes: data ?? [],
      isLoaded: true,
    },
  };
}

export function getSelectedStorageIdFromState(state) {
  const selectedStorage = getSelectedStorage(state.mtpStoragesList);

  if (isEmpty(selectedStorage)) {
    return null;
  }

  return selectedStorage.id;
}

export function getSelectedStorage(mtpStoragesList) {
  checkIf(mtpStoragesList, 'object');

  if (isEmpty(mtpStoragesList)) {
    return null;
  }

  const mtpStoragesListKeys = Object.keys(mtpStoragesList);

  for (let i = 0; i < mtpStoragesListKeys.length; i += 1) {
    const itemKey = mtpStoragesListKeys[i];

    if (mtpStoragesList[itemKey].selected) {
      return { id: itemKey, data: mtpStoragesList[itemKey] };
    }
  }

  return null;
}

export function initializeMtp(
  {
    filePath,
    ignoreHidden,
    changeLegacyMtpStorageOnlyOnDeviceChange,
    deviceType,
  },
  getState
) {
  checkIf(deviceType, 'string');
  checkIf(filePath, 'string');
  checkIf(ignoreHidden, 'boolean');
  checkIf(changeLegacyMtpStorageOnlyOnDeviceChange, 'boolean');
  checkIf(getState, 'function');

  const { mtpStoragesList } = getState().Home;
  const { mtpMode } = getState().Settings;

  return async (dispatch) => {
    try {
      switch (mtpMode) {
        case MTP_MODE.kalam:
          return dispatch(
            initKalamMtp(
              {
                filePath,
                ignoreHidden,
                deviceType,
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
                changeLegacyMtpStorageOnlyOnDeviceChange,
              },
              getState
            )
          );

        default:
          return;
      }
    } catch (e) {
      log.error(e);
    }
  };
}

export function disposeMtp({ deviceType, onSuccess, onError }, getState) {
  return async (dispatch) => {
    const { mtpMode } = getState().Settings;

    checkIf(deviceType, 'string');
    checkIf(onSuccess, 'function');
    checkIf(onError, 'function');
    checkIf(mtpMode, 'string');

    try {
      switch (mtpMode) {
        case MTP_MODE.kalam:
          // eslint-disable-next-line no-case-declarations
          const { error, stderr, data } = await fileExplorerController.dispose({
            deviceType,
          });

          await new Promise((resolve) => {
            dispatch(
              churnMtpBuffer({
                deviceType,
                error,
                stderr,
                data,
                mtpMode,
                onSuccess: ({ _, __, data }) => {
                  dispatch(
                    actionSetMtpStatus({ info: {}, isAvailable: false })
                  );
                  dispatch(actionListDirectory([], deviceType));
                  dispatch(
                    actionSetSelectedDirLists({ selected: [] }, deviceType)
                  );
                  dispatch(actionChangeMtpStorage({}));

                  const _return = {
                    error: null,
                    stderr: null,
                    data,
                  };

                  onSuccess(_return);

                  return resolve(_return);
                },
                onError: ({ _, __, ___ }) => {
                  const _return = {
                    error,
                    stderr,
                    data: null,
                  };

                  onError(_return);

                  return resolve(_return);
                },
              })
            );
          });

          return;

        default:
          return;
      }
    } catch (e) {
      log.error(e);
    }
  };
}

function initKalamMtp({ filePath, ignoreHidden, deviceType }, getState) {
  return async (dispatch) => {
    checkIf(filePath, 'string');
    checkIf(ignoreHidden, 'boolean');
    checkIf(deviceType, 'string');

    try {
      const { mtpMode } = getState().Settings;
      const { mtpDevice: preInitMtpDevice } = getState().Home;

      checkIf(preInitMtpDevice, 'object');

      dispatch(
        actionSetMtpStatus({
          isLoading: true,
        })
      );

      // if the app was expecting the user to allow access to mtp storage
      // then don't reinitialize mtp
      const { error, stderr, data } = await fileExplorerController.initialize({
        deviceType,
      });

      await new Promise((resolve) => {
        dispatch(
          churnMtpBuffer({
            deviceType,
            error,
            stderr,
            data,
            mtpMode,
            onSuccess: ({ _, __, data }) => {
              dispatch(actionSetMtpStatus({ info: data }));

              return resolve({
                error: null,
                stderr: null,
                data,
              });
            },
            onError: ({ _, __, ___ }) => {
              return resolve({
                error,
                stderr,
                data: null,
              });
            },
          })
        );
      });

      const { mtpDevice: postInitMtpDevice } = getState().Home;

      checkIf(postInitMtpDevice, 'object');

      if (!postInitMtpDevice.isAvailable) {
        return;
      }

      let _filePath = filePath;

      if (
        !undefinedOrNull(preInitMtpDevice?.info?.SerialNumber) &&
        !undefinedOrNull(postInitMtpDevice?.info?.SerialNumber) &&
        preInitMtpDevice?.info?.SerialNumber !==
          postInitMtpDevice?.info?.SerialNumber
      ) {
        _filePath = DEVICES_DEFAULT_PATH[deviceType];
        dispatch(actionChangeMtpStorage({}));
      }

      dispatch(
        actionSetMtpStatus({
          isLoading: true,
        })
      );

      await new Promise((resolve) => {
        dispatch(
          listKalamStorages(
            {
              filePath,
              ignoreHidden,
              deviceType,
              onSuccess: () => {
                resolve();
              },
              onError: () => {
                resolve();
              },
            },
            getState
          )
        );
      });

      const { mtpDevice: postStorageAccessMtpDevice } = getState().Home;

      checkIf(postStorageAccessMtpDevice, 'object');

      if (!postStorageAccessMtpDevice.isAvailable) {
        return;
      }

      dispatch(
        actionSetMtpStatus({
          isLoading: true,
        })
      );

      dispatch(
        reloadDirList(
          { filePath: _filePath, ignoreHidden, deviceType },
          getState
        )
      );
    } catch (e) {
      log.error(e);
    }
  };
}

function listKalamStorages(
  { filePath, ignoreHidden, deviceType, onSuccess, onError },
  getState
) {
  return async (dispatch) => {
    checkIf(filePath, 'string');
    checkIf(ignoreHidden, 'boolean');
    checkIf(deviceType, 'string');
    checkIf(onSuccess, 'function');
    checkIf(onError, 'function');

    try {
      const { mtpMode } = getState().Settings;

      checkIf(mtpMode, 'string');

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
              dispatch(actionChangeMtpStorage({ ...data }));

              onSuccess();

              return resolve({
                error: null,
                stderr: null,
                data,
              });
            },
            onError: async () => {
              onError();

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
    changeLegacyMtpStorageOnlyOnDeviceChange,
  },
  getState
) {
  return async (dispatch) => {
    checkIf(filePath, 'string');
    checkIf(ignoreHidden, 'boolean');
    checkIf(deviceType, 'string');
    checkIf(mtpStoragesList, 'object');
    checkIf(changeLegacyMtpStorageOnlyOnDeviceChange, 'boolean');

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
              changeLegacyMtpStorageOnlyOnDeviceChange &&
              !isEmpty(mtpStoragesList) &&
              isArraysEqual(Object.keys(data), Object.keys(mtpStoragesList))
            ) {
              updateMtpStorage = false;
            }

            if (updateMtpStorage) {
              dispatch(actionChangeMtpStorage({ ...data }));
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

export function actionChangeMtpStorage({ ...data }) {
  return {
    type: actionTypes.CHANGE_MTP_STORAGE,
    payload: data,
  };
}

/**
 *
 * @param args {isAvailable, error, isLoading, info}
 * @return {{payload: {}, type: *}}
 */
export function actionSetMtpStatus({ ...args }) {
  return {
    type: actionTypes.SET_MTP_STATUS,
    payload: args,
  };
}

// This is the main entry point of data received from the MTP kernel.
// The data received here undergoes processing and the neccessary actions are taken accordingly
export function churnMtpBuffer({
  deviceType,
  error,
  stderr,
  data,
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

      dispatch(
        actionSetMtpStatus({
          isAvailable: mtpStatus,
          error: mtpMode === MTP_MODE.kalam ? stderr : error,
          isLoading: false,
        })
      );

      if (!mtpStatus) {
        dispatch(actionListDirectory([], deviceType));
        dispatch(actionSetSelectedDirLists({ selected: [] }, deviceType));

        if (onError) {
          onError({ error, stderr, data: null });
        }
      }

      if (mtpError) {
        log.error(mtpError, 'churnMtpBuffer.mtpError', mtpLogError);
        log.error(error, 'churnMtpBuffer.error');
        log.error(stderr, 'churnMtpBuffer.stderr');
        if (mtpThrowAlert) {
          dispatch(throwAlert({ message: mtpError.toString() }));
        }

        return;
      }

      return onSuccess({ error: null, stderr: null, data });
    } catch (e) {
      log.error(e);
    }
  };
}

// this is the main entry point of data received from the local disk file actions.
// the data received here undergoes processing and the neccessary actions are taken accordingly
export function churnLocalBuffer({
  _,
  error,
  stderr,
  data,
  onSuccess,
  onError,
}) {
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

        if (onError) {
          onError({ error, stderr, data: null });
        }

        return false;
      }

      onSuccess({ error: null, stderr: null, data });
    } catch (e) {
      log.error(e);
    }
  };
}

export function listDirectory(
  { filePath, ignoreHidden, onError, onSuccess },
  deviceType,
  getState
) {
  checkIf(filePath, 'string');
  checkIf(ignoreHidden, 'boolean');
  checkIf(getState, 'function');

  const { mtpMode } = getState().Settings;

  try {
    switch (deviceType) {
      case DEVICE_TYPE.local:
        return async (dispatch) => {
          const { error, data } = await fileExplorerController.listFiles({
            deviceType,
            filePath,
            ignoreHidden,
            storageId: null,
          });

          if (error) {
            log.error(error, 'listDirectory -> listFiles');
            dispatch(
              throwAlert({ message: `Unable fetch data from the Local disk.` })
            );

            return;
          }

          dispatch(actionListDirectory(data, deviceType), getState);
          dispatch(setCurrentBrowsePath(filePath, deviceType));
          dispatch(actionSetSelectedDirLists({ selected: [] }, deviceType));
        };

      case DEVICE_TYPE.mtp:
        return async (dispatch) => {
          const storageId = getSelectedStorageIdFromState(getState().Home);

          const {
            error,
            stderr,
            data,
          } = await fileExplorerController.listFiles({
            deviceType,
            filePath,
            ignoreHidden,
            storageId,
          });

          dispatch(
            churnMtpBuffer({
              deviceType,
              error,
              stderr,
              data,
              mtpMode,
              onSuccess: ({ error, stderr, data }) => {
                dispatch(actionListDirectory(data, deviceType), getState);
                dispatch(
                  actionSetSelectedDirLists({ selected: [] }, deviceType)
                );
                dispatch(setCurrentBrowsePath(filePath, deviceType));

                if (onSuccess) {
                  onSuccess({ error, stderr, data });
                }
              },

              onError: ({ error, stderr, data }) => {
                if (onError) {
                  onError({ error, stderr, data });
                }
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

  const { mtpMode, mtpDevice } = getState().Home;

  checkIf(mtpDevice, 'object');

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
                  changeLegacyMtpStorageOnlyOnDeviceChange: true,
                  deviceType,
                },
                getState
              )
            );

          case MTP_MODE.kalam:
          default:
            dispatch(
              actionSetMtpStatus({
                isLoading: true,
              })
            );

            // if mtpdevice is available then list directory
            if (mtpDevice.isAvailable) {
              return dispatch(
                listDirectory(
                  {
                    filePath,
                    ignoreHidden,
                    onError: ({ stderr }) => {
                      // if device was changed then reinitialize the mtp
                      if (stderr === MTP_ERROR.ErrorDeviceChanged) {
                        dispatch(
                          initializeMtp(
                            {
                              filePath,
                              ignoreHidden,
                              changeLegacyMtpStorageOnlyOnDeviceChange: true,
                              deviceType,
                            },
                            getState
                          )
                        );
                      }
                    },
                    onSuccess: () => {},
                  },
                  deviceType,
                  getState
                )
              );
            }

            // if the mtp was not previously initialized then initialize it
            return dispatch(
              initializeMtp(
                {
                  filePath,
                  ignoreHidden,
                  changeLegacyMtpStorageOnlyOnDeviceChange: true,
                  deviceType,
                },
                getState
              )
            );
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
