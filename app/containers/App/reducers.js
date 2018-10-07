'use strict';
import { PATHS } from '../../utils/paths';
import { actionTypes } from './actions';

export const initialState = {
  /* <Meta Data> */
  ___isDefault: true,
  ___isLoading: false,
  ___timeGenerated: null,
  ___timeLastModified: null,
  ___error: null,
  /* </Meta Data> */

  toolbarList: {
    up: {
      enabled: true,
      label: 'Folder Up',
      imgSrc: 'Toolbar/up.svg',
      invert: false
    },
    queueMode: {
      enabled: true,
      label: 'Toggle Queue Mode',
      imgSrc: 'Toolbar/queue-mode.svg',
      invert: false
    },
    excludeFromQueue: {
      enabled: true,
      label: 'Exclude Item from Queue',
      imgSrc: 'Toolbar/exclude-from-queue.svg',
      invert: false
    },
    emptyQueue: {
      enabled: true,
      label: 'Empty Queue',
      imgSrc: 'Toolbar/empty-queue.svg',
      invert: false
    },
    compress: {
      enabled: true,
      label: 'Compress',
      imgSrc: 'Toolbar/compress.svg',
      invert: false
    },
    extractArchive: {
      enabled: true,
      label: 'Extract Archive',
      imgSrc: 'Toolbar/extract.svg',
      invert: false
    },
    testArchive: {
      enabled: true,
      label: 'Test Archive',
      imgSrc: 'Toolbar/test.svg',
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
  }
};

export default function App(state = initialState, action) {
  let { type, payload } = action;
  switch (type) {
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
