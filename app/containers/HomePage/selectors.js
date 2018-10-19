import { createSelector } from 'reselect';
import { getMtpStoragesListSelected } from './actions';

const make = (state, props) => state.Home;

export const makeToolbarList = createSelector(
  make,
  state => (state ? state.toolbarList : {})
);

export const makeSidebarFavouriteList = createSelector(
  make,
  state => (state ? state.sidebarFavouriteList : {})
);

export const makeCurrentBrowsePath = createSelector(
  make,
  state => (state ? state.currentBrowsePath : {})
);

export const makeDirectoryLists = createSelector(
  make,
  state => (state ? state.directoryLists : {})
);

export const makeMtpDevice = createSelector(
  make,
  state => (state ? state.mtpDevice : {})
);

export const makeContextMenuPos = createSelector(
  make,
  state => (state ? state.contextMenuPos : {})
);

export const makeContextMenuList = createSelector(
  make,
  state => (state ? state.contextMenuList : {})
);

export const makeMtpStoragesList = createSelector(
  make,
  state => (state ? state.mtpStoragesList : {})
);

export const makeMtpStoragesListSelected = createSelector(
  make,
  state => (state ? getMtpStoragesListSelected(state) : {})
);

export const makeFileTransferClipboard = createSelector(
  make,
  state => (state ? state.fileTransfer.clipboard : {})
);

export const makeFileTransferProgess = createSelector(
  make,
  state => (state ? state.fileTransfer.progress : {})
);

export const makeIsLoading = createSelector(
  make,
  state => (state ? state.___isLoading : {})
);
