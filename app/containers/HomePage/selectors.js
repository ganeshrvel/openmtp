'use strict';

import { createSelector } from 'reselect';
import { getMtpStoragesListSelected } from './actions';
import { initialState } from './reducers';

const make = (state, props) => (state ? state.Home : {});

export const makeFocussedFileExplorerDeviceType = createSelector(make, state =>
  state
    ? state.focussedFileExplorerDeviceType
    : initialState.focussedFileExplorerDeviceType
);

export const makeToolbarList = createSelector(make, state =>
  state ? state.toolbarList : initialState.toolbarList
);

export const makeSidebarFavouriteList = createSelector(make, state =>
  state ? state.sidebarFavouriteList : initialState.sidebarFavouriteList
);

export const makeCurrentBrowsePath = createSelector(make, state =>
  state ? state.currentBrowsePath : initialState.currentBrowsePath
);

export const makeDirectoryLists = createSelector(make, state =>
  state ? state.directoryLists : initialState.directoryLists
);

export const makeMtpDevice = createSelector(make, state =>
  state ? state.mtpDevice : initialState.mtpDevice
);

export const makeContextMenuList = createSelector(make, state =>
  state ? state.contextMenuList : initialState.contextMenuList
);

export const makeMtpStoragesList = createSelector(make, state =>
  state ? state.mtpStoragesList : initialState.mtpStoragesList
);

export const makeMtpStoragesListSelected = createSelector(make, state =>
  state ? getMtpStoragesListSelected(state) : {}
);

export const makeFileTransferClipboard = createSelector(make, state =>
  state ? state.fileTransfer.clipboard : initialState.fileTransfer.clipboard
);

export const makeFileTransferProgess = createSelector(make, state =>
  state ? state.fileTransfer.progress : initialState.fileTransfer.progress
);

export const makeFilesDrag = createSelector(make, state =>
  state ? state.filesDrag : initialState.filesDrag
);
