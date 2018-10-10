'use strict';

import { actionTypes } from './actions';
import { PATHS } from '../../utils/paths';
import { deviceType } from '../../constants';
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
    local: {
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
      }
    },
    mtp: {
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
      }
    }
  },

  directoryLists: {
    [deviceType.local]: {
      order: 'asc',
      orderBy: 'path',
      queue: {
        selected: []
      },
      nodes: []
    },
    [deviceType.mtp]: {
      order: 'asc',
      orderBy: 'path',
      queue: {
        selected: []
      },
      nodes: []
    }
  },

  selectedPath: {
    [deviceType.local]: PATHS.homeDir,
    [deviceType.mtp]: '/'
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

    case actionTypes.SET_SELECTED_PATH:
      return {
        ...state,
        ...setLoadedMetaData(state),
        selectedPath: {
          ...state.selectedPath,
          [deviceType]: payload
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
