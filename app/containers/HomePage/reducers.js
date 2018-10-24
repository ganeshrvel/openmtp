'use strict';

import { actionTypes } from './actions';
import { PATHS } from '../../utils/paths';
import { devicesDefaultPaths, deviceTypeConst } from '../../constants';
import path from 'path';

export const initialState = {
  /* <Meta Data> */
  ___isDefault: true,
  ___isLoading: false,
  ___timeGenerated: null,
  ___timeLastModified: null,
  ___error: null,
  /* </Meta Data> */

  sidebarFavouriteList: {
    top: [
      {
        label: 'Home',
        path: PATHS.homeDir,
        icon: 'folder',
        enabled: true
      },
      {
        label: 'Desktop',
        path: path.join(PATHS.homeDir, `/Desktop`),
        icon: 'folder',
        enabled: true
      },
      {
        label: 'Downloads',
        path: path.join(PATHS.homeDir, `/Downloads`),
        icon: 'folder',
        enabled: true
      },
      {
        label: 'Root',
        path: '/',
        icon: 'folder',
        enabled: true
      }
    ],
    bottom: []
  },

  toolbarList: {
    [deviceTypeConst.local]: {
      up: {
        enabled: true,
        label: 'Folder Up',
        imgSrc: 'Toolbar/up.svg',
        invert: false
      },
      refresh: {
        enabled: true,
        label: 'Refresh',
        imgSrc: 'Toolbar/refresh.svg',
        invert: false
      },
      delete: {
        enabled: true,
        label: 'Delete',
        imgSrc: 'Toolbar/delete.svg'
      },
      settings: {
        enabled: true,
        label: 'Settings',
        imgSrc: 'Toolbar/settings.svg'
      }
    },
    [deviceTypeConst.mtp]: {
      up: {
        enabled: true,
        label: 'Folder Up',
        imgSrc: 'Toolbar/up.svg',
        invert: false
      },
      refresh: {
        enabled: true,
        label: 'Refresh',
        imgSrc: 'Toolbar/refresh.svg',
        invert: false
      },
      delete: {
        enabled: true,
        label: 'Delete',
        imgSrc: 'Toolbar/delete.svg'
      },
      storage: {
        enabled: true,
        label: 'Storage',
        imgSrc: 'Toolbar/storage.svg'
      },
      settings: {
        enabled: true,
        label: 'Settings',
        imgSrc: 'Toolbar/settings.svg'
      }
    }
  },

  directoryLists: {
    [deviceTypeConst.local]: {
      order: 'asc',
      orderBy: 'name',
      queue: {
        selected: []
      },
      nodes: []
    },
    [deviceTypeConst.mtp]: {
      order: 'asc',
      orderBy: 'name',
      queue: {
        selected: []
      },
      nodes: []
    }
  },

  currentBrowsePath: {
    [deviceTypeConst.local]: devicesDefaultPaths.local,
    [deviceTypeConst.mtp]: devicesDefaultPaths.mtp
  },

  mtpDevice: {
    isAvailable: false
  },
  contextMenuList: {
    [deviceTypeConst.local]: {
      rename: {
        enabled: true,
        label: 'Rename',
        data: {}
      },
      copy: {
        enabled: true,
        label: 'Copy',
        data: {}
      },
      paste: {
        enabled: true,
        label: 'Paste',
        data: {}
      },
      newFolder: {
        enabled: true,
        label: 'New Folder',
        data: {}
      }
    },
    [deviceTypeConst.mtp]: {
      copy: {
        enabled: true,
        label: 'Copy',
        data: {}
      },
      paste: {
        enabled: true,
        label: 'Paste',
        data: {}
      },
      newFolder: {
        enabled: true,
        label: 'New Folder',
        data: {}
      }
    }
  },

  mtpStoragesList: {},

  fileTransfer: {
    clipboard: {
      queue: [],
      source: null
    },
    progress: {
      toggle: false,
      bodyText1: null,
      bodyText2: null,
      percentage: 0
    }
  }
};

export default function Home(state = initialState, action) {
  let { type, payload, deviceType = null } = action;
  switch (type) {
    case actionTypes.SET_SORTING_DIR_LISTS:
      return {
        ...state,
        ...setLoadedMetaData(state),
        directoryLists: {
          ...state.directoryLists,
          [deviceType]: {
            ...state.directoryLists[deviceType],
            ...payload
          }
        }
      };

    case actionTypes.SET_SELECTED_DIR_LISTS:
      return {
        ...state,
        ...setLoadedMetaData(state),
        directoryLists: {
          ...state.directoryLists,
          [deviceType]: {
            ...state.directoryLists[deviceType],
            queue: {
              selected: payload.selected
            }
          }
        }
      };

    case actionTypes.SET_CURRENT_BROWSE_PATH:
      return {
        ...state,
        ...setLoadedMetaData(state),
        currentBrowsePath: {
          ...state.currentBrowsePath,
          [deviceType]: payload
        }
      };

    case actionTypes.SET_MTP_STATUS:
      return {
        ...state,
        ...setLoadedMetaData(state),
        mtpDevice: {
          ...state.mtpDevice,
          isAvailable: payload
        }
      };

    case actionTypes.FETCH_DIR_LIST:
      return {
        ...state,
        ...setLoadedMetaData(state),
        directoryLists: {
          ...state.directoryLists,
          [deviceType]: {
            ...state.directoryLists[deviceType],
            nodes: [...payload.nodes]
          }
        }
      };

    case actionTypes.CHANGE_MTP_STORAGE:
      return {
        ...state,
        ...setLoadedMetaData(state),
        mtpStoragesList: {
          ...initialState.mtpStoragesList,
          ...payload
        }
      };

    case actionTypes.SET_FILE_TRANSFER_CLIPBOARD:
      return {
        ...state,
        ...setLoadedMetaData(state),
        fileTransfer: {
          ...state.fileTransfer,
          clipboard: {
            ...payload
          }
        }
      };

    case actionTypes.SET_FILE_TRANSFER_PROGRESS:
      return {
        ...state,
        ...setLoadedMetaData(state),
        fileTransfer: {
          ...state.fileTransfer,
          progress: {
            ...payload
          }
        }
      };

    case actionTypes.CLEAR_FILE_TRANSFER:
      return {
        ...state,
        ...setLoadedMetaData(state),
        fileTransfer: {
          ...initialState.fileTransfer
        }
      };

    /* <Meta Data> */
    case actionTypes.REQ_LOAD:
      return {
        ...state,
        ___isLoading: true
      };
    case actionTypes.RES_LOAD:
      return {
        ...state,
        ...setLoadedMetaData(state)
      };
    case actionTypes.FAIL_LOAD:
      return {
        ...state,
        ___isLoading: false,
        ___error: payload.error
      };
    /* </Meta Data> */
    default:
      return state;
  }
}

function setLoadedMetaData(state) {
  const ms = Date.now();
  return {
    ___isLoading: false,
    ___isDefault: false,
    ___timeGenerated: state.___timeGenerated ? state.___timeGenerated : ms,
    ___timeLastModified: ms,
    ___error: null
  };
}
