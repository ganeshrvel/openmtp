'use strict';

import { actionTypes } from './actions';
import { PATHS } from '../../utils/paths';

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
        selected: true,
        enabled: true
      },
      {
        label: 'usr',
        path: '/usr/',
        icon: 'folder',
        selected: false,
        enabled: true
      },
      {
        label: 'Root',
        path: '/',
        icon: 'folder',
        selected: false,
        enabled: true
      },
      {
        label: 'Folder 4',
        path: '/tmp/',
        icon: 'folder',
        selected: false,
        enabled: true
      },
      {
        label: 'Folder 5',
        path: '/tmp/',
        icon: 'folder',
        selected: false,
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
      rename: {
        enabled: true,
        label: 'Rename',
        imgSrc: 'Toolbar/rename.svg',
        invert: false
      },
      delete: {
        enabled: true,
        label: 'Delete',
        imgSrc: 'Toolbar/delete.svg'
      },
      info: {
        enabled: true,
        label: 'Information',
        imgSrc: 'Toolbar/info.svg',
        invert: false
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
      rename: {
        enabled: true,
        label: 'Rename',
        imgSrc: 'Toolbar/rename.svg',
        invert: false
      },
      delete: {
        enabled: true,
        label: 'Delete',
        imgSrc: 'Toolbar/delete.svg'
      },
      info: {
        enabled: true,
        label: 'Information',
        imgSrc: 'Toolbar/info.svg',
        invert: false
      }
    }
  },

  directoryLists: {
    local: {
      order: 'asc',
      orderBy: 'path',
      queue: {
        selected: []
      },
      nodes: []
    },
    mtp: {
      order: 'asc',
      orderBy: 'path',
      queue: {
        selected: []
      },
      nodes: []
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
          ...payload
        }
      };

    case actionTypes.SET_SELECTED_DIR_LISTS:
      return {
        ...state,
        ...setLoadedMetaData(state),
        directoryLists: {
          ...state.directoryLists,
          queue: {
            ...payload
          }
        }
      };

    case actionTypes.FETCH_DIR_LIST:
      return {
        ...state,
        ...setLoadedMetaData(state),
        directoryLists: {
          ...state.directoryLists,
          /*[deviceType]: {
            ...payload
          }*/
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
