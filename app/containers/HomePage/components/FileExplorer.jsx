'use strict';

/* eslint no-case-declarations: off */

import React, { Component } from 'react';
import { remote, ipcRenderer, shell } from 'electron';
import lodashSortBy from 'lodash/sortBy';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { log } from '@Log';
import {
  TextFieldEdit as TextFieldEditDialog,
  ProgressBar as ProgressBarDialog,
  Confirm as ConfirmDialog
} from '../../../components/DialogBox';
import { withReducer } from '../../../store/reducers/withReducer';
import reducers from '../reducers';
import {
  setSortingDirLists,
  setSelectedDirLists,
  fetchDirList,
  processMtpOutput,
  processLocalOutput,
  setMtpStorageOptions,
  getMtpStoragesListSelected,
  setFileTransferClipboard,
  setFilesDrag,
  clearFilesDrag
} from '../actions';
import {
  makeDirectoryLists,
  makeIsLoading,
  makeCurrentBrowsePath,
  makeMtpDevice,
  makeContextMenuList,
  makeMtpStoragesListSelected,
  makeFileTransferClipboard,
  makeFileTransferProgess,
  makeFilesDrag
} from '../selectors';
import {
  makeFileExplorerListingType,
  makeHideHiddenFiles
} from '../../Settings/selectors';
import { DEVICES_LABEL, DEVICES_TYPE_CONST } from '../../../constants';
import {
  renameLocalFiles,
  checkFileExists,
  newLocalFolder,
  newMtpFolder,
  pasteFiles,
  renameMtpFiles
} from '../../../api/sys';
import { baseName, pathInfo, pathUp, sanitizePath } from '../../../utils/paths';
import {
  isFloat,
  isInt,
  isNumber,
  undefinedOrNull
} from '../../../utils/funcs';
import { throwAlert } from '../../Alerts/actions';
import { imgsrc } from '../../../utils/imgsrc';
import FileExplorerBodyRender from './FileExplorerBodyRender';

const { Menu, getCurrentWindow } = remote;

const filesDragGhostImg = new Image(0, 0);
filesDragGhostImg.src = imgsrc('FileExplorer/copy.svg');

let allowFileDropFlag = false;

class FileExplorer extends Component {
  constructor(props) {
    super(props);
    this.initialState = {
      togglePasteConfirmDialog: false,
      toggleDialog: {
        rename: {
          errors: {
            toggle: false,
            message: null
          },
          toggle: false,
          data: {}
        },
        newFolder: {
          errors: {
            toggle: false,
            message: null
          },
          toggle: false,
          data: {}
        }
      }
    };
    this.state = {
      ...this.initialState
    };

    this.electronMenu = new Menu();
  }

  componentWillMount() {
    const {
      currentBrowsePath,
      deviceType,
      handleFetchMtpStorageOptions,
      hideHiddenFiles
    } = this.props;

    if (deviceType === DEVICES_TYPE_CONST.mtp) {
      handleFetchMtpStorageOptions(
        {
          filePath: currentBrowsePath[deviceType],
          ignoreHidden: hideHiddenFiles[deviceType]
        },
        deviceType
      );
    } else {
      this._fetchDirList({
        path: currentBrowsePath[deviceType],
        deviceType
      });
    }
  }

  componentDidMount() {
    const { deviceType } = this.props;
    /**
     * check whether an active file trasfer window is available.
     * This is to prevent race between file transfer and app update taskbar progressbar access
     */

    if (deviceType === DEVICES_TYPE_CONST.local) {
      ipcRenderer.on('isFileTransferActiveSeek', (event, { ...args }) => {
        const { check: checkIsFileTransferActiveSeek } = args;
        if (!checkIsFileTransferActiveSeek) {
          return null;
        }

        const { fileTransferProgess } = this.props;
        const { toggle: isActiveFileTransferProgess } = fileTransferProgess;

        ipcRenderer.send('isFileTransferActiveReply', {
          isActive: isActiveFileTransferProgess
        });
      });
    }
  }

  _fetchDirList({ ...args }) {
    const { handleFetchDirList, hideHiddenFiles } = this.props;
    const { path, deviceType } = args;

    handleFetchDirList(
      {
        filePath: path,
        ignoreHidden: hideHiddenFiles[deviceType]
      },
      deviceType
    );
  }

  fireElectronMenu(menuItems) {
    this.electronMenu = Menu.buildFromTemplate(menuItems);
    this.electronMenu.popup(remote.getCurrentWindow());
  }

  _handleContextMenuClick = (
    event,
    { ...rowData },
    { ...tableData },
    _target
  ) => {
    const { deviceType, mtpDevice, fileExplorerListingType } = this.props;
    const allowContextMenuClickThrough =
      fileExplorerListingType[deviceType] === 'grid' &&
      !undefinedOrNull(rowData) &&
      Object.keys(rowData).length < 1;

    if (deviceType === DEVICES_TYPE_CONST.mtp && !mtpDevice.isAvailable) {
      return null;
    }

    if (event.type === 'contextmenu') {
      if (
        _target === 'tableWrapperTarget' &&
        event.target !== event.currentTarget &&
        !allowContextMenuClickThrough
      ) {
        return null;
      }

      const contextMenuActiveList = this.activeContextMenuList(
        deviceType,
        { ...rowData },
        { ...tableData }
      );

      this.fireElectronMenu(contextMenuActiveList);
      return null;
    }
  };

  activeContextMenuList(deviceType, { ...rowData }, { ...tableData }) {
    const {
      contextMenuList,
      fileTransferClipboard,
      directoryLists
    } = this.props;
    const { queue } = directoryLists[deviceType];
    const _contextMenuList = contextMenuList[deviceType];
    const contextMenuActiveList = [];

    Object.keys(_contextMenuList).map(a => {
      const item = _contextMenuList[a];
      switch (a) {
        case 'rename':
          contextMenuActiveList.push({
            label: item.label,
            enabled: Object.keys(rowData).length > 0,
            data: rowData,
            click: () => {
              this._handleContextMenuListActions({
                [a]: {
                  ...item,
                  data: rowData
                }
              });
            }
          });
          break;

        case 'copy':
          contextMenuActiveList.push({
            label: item.label,
            enabled: queue.selected.length > 0,
            click: () => {
              this._handleContextMenuListActions({
                [a]: {
                  ...item,
                  data: {}
                }
              });
            }
          });
          break;

        case 'paste':
          contextMenuActiveList.push({
            label: item.label,
            enabled:
              fileTransferClipboard.queue.length > 0 &&
              fileTransferClipboard.source !== deviceType,
            click: () => {
              this._handleContextMenuListActions({
                [a]: {
                  ...item,
                  data: {}
                }
              });
            }
          });

          break;

        case 'newFolder':
          contextMenuActiveList.push({
            label: item.label,
            data: tableData,
            click: () => {
              this._handleContextMenuListActions({
                [a]: {
                  ...item,
                  data: tableData
                }
              });
            }
          });

          break;
        default:
          break;
      }

      return contextMenuActiveList;
    });

    return contextMenuActiveList;
  }

  _handleContextMenuListActions = ({ ...args }) => {
    const { deviceType, directoryLists, handleCopy } = this.props;
    let selected = null;

    Object.keys(args).map(a => {
      const item = args[a];
      switch (a) {
        case 'rename':
          this.handleToggleDialogBox(
            {
              toggle: true,
              data: {
                ...item.data
              }
            },
            'rename'
          );
          break;
        case 'copy':
          // eslint-disable-next-line prefer-destructuring
          selected = directoryLists[deviceType].queue.selected;
          handleCopy({ selected, deviceType });
          break;
        case 'paste':
          this._handlePaste();
          break;
        case 'newFolder':
          this.handleToggleDialogBox(
            {
              toggle: true,
              data: {
                ...item.data
              }
            },
            'newFolder'
          );
          break;
        case 'pasteFromDrag':
          // eslint-disable-next-line prefer-destructuring
          selected = directoryLists[item.data.sourceDeviceType].queue.selected;
          handleCopy({ selected, deviceType: item.data.sourceDeviceType });
          this._handlePaste();
          break;
        case 'cancel':
          break;
        default:
          break;
      }

      return selected;
    });
  };

  handleToggleDialogBox = ({ ...args }, targetAction) => {
    const { toggleDialog } = this.state;
    this.setState({
      toggleDialog: {
        ...toggleDialog,
        [targetAction]: {
          ...toggleDialog[targetAction],
          ...args
        }
      }
    });
  };

  handleRenameEditDialog = async ({ ...args }) => {
    const {
      deviceType,
      handleRenameFile,
      hideHiddenFiles,
      currentBrowsePath,
      mtpStoragesListSelected
    } = this.props;

    // eslint-disable-next-line react/destructuring-assignment
    const { data } = this.state.toggleDialog.rename;
    const { confirm, textFieldValue: newFileName } = args;
    const targetAction = 'rename';

    if (!confirm || newFileName === null) {
      this.clearEditDialog(targetAction);
      return null;
    }

    if (newFileName.trim() === '' || /[/\\?%*:|"<>]/g.test(newFileName)) {
      this.handleErrorsEditDialog(
        {
          toggle: true,
          message: `Error: Illegal characters.`
        },
        targetAction
      );
      return null;
    }

    // same file name; no change
    const _pathUp = pathUp(data.path);
    const newFilePath = sanitizePath(`${_pathUp}/${newFileName}`);
    const oldFilePath = data.path;

    if (newFilePath === data.path) {
      this.clearEditDialog(targetAction);
      return null;
    }

    if (
      await checkFileExists(newFilePath, deviceType, mtpStoragesListSelected)
    ) {
      this.handleErrorsEditDialog(
        {
          toggle: true,
          message: `Error: The name "${newFileName}" is already taken.`
        },
        targetAction
      );
      return null;
    }
    handleRenameFile(
      {
        oldFilePath,
        newFilePath,
        deviceType
      },
      {
        filePath: currentBrowsePath[deviceType],
        ignoreHidden: hideHiddenFiles[deviceType]
      }
    );

    this.clearEditDialog(targetAction);
  };

  handleErrorsEditDialog = ({ ...args }, targetAction) => {
    const { toggleDialog } = this.state;
    this.setState({
      toggleDialog: {
        ...toggleDialog,
        [targetAction]: {
          ...toggleDialog[targetAction],
          errors: { ...args }
        }
      }
    });
  };

  clearEditDialog = targetAction => {
    const { toggleDialog } = this.state;
    this.setState({
      toggleDialog: {
        ...toggleDialog,
        [targetAction]: {
          ...this.initialState.toggleDialog[targetAction]
        }
      }
    });
  };

  handleTogglePasteConfirmDialog = status => {
    this.setState({
      togglePasteConfirmDialog: status
    });
  };

  handleFilesDragStart = (e, { sourceDeviceType }) => {
    this.setFilesDrag({
      sourceDeviceType,
      destinationDeviceType: null,
      enter: false,
      lock: false
    });

    e.dataTransfer.setDragImage(filesDragGhostImg, 0, 0);
  };

  handleFilesDragOver = (e, { destinationDeviceType }) => {
    const { filesDrag } = this.props;
    e.preventDefault();
    e.stopPropagation();

    if (destinationDeviceType === filesDrag.sourceDeviceType) {
      if (filesDrag.sameSourceDestinationLock) {
        return null;
      }

      allowFileDropFlag = false;
      this.setFilesDrag({
        sourceDeviceType: filesDrag.sourceDeviceType,
        destinationDeviceType,
        enter: false,
        lock: false,
        sameSourceDestinationLock: true
      });
      return null;
    }

    if (filesDrag.lock) {
      return null;
    }

    allowFileDropFlag = true;
    this.setFilesDrag({
      sourceDeviceType: filesDrag.sourceDeviceType,
      destinationDeviceType,
      enter: true,
      lock: true,
      sameSourceDestinationLock: false
    });
  };

  handleFilesDragEnd = () => {
    this.clearFilesDrag();
  };

  handleTableDrop = () => {
    const { filesDrag } = this.props;
    const { sourceDeviceType, destinationDeviceType } = filesDrag;

    if (
      !allowFileDropFlag ||
      destinationDeviceType === null ||
      destinationDeviceType === null ||
      sourceDeviceType === destinationDeviceType
    ) {
      return null;
    }

    const contextMenu = [
      {
        label: `Paste`,
        enabled: true,
        data: {
          ...filesDrag
        },
        click: () => {
          this._handleContextMenuListActions({
            [`pasteFromDrag`]: {
              data: {
                ...filesDrag
              }
            }
          });
        }
      },
      {
        label: `Cancel`,
        enabled: true,
        data: {},
        click: () => {
          this._handleContextMenuListActions({
            [`cancel`]: {
              data: {}
            }
          });
        }
      }
    ];

    this.clearFilesDrag();
    this.fireElectronMenu(contextMenu);
  };

  handleOnHoverDropZoneActivate = deviceType => {
    const { filesDrag, mtpDevice } = this.props;
    const { sourceDeviceType, destinationDeviceType } = filesDrag;

    if (sourceDeviceType === destinationDeviceType || !mtpDevice.isAvailable) {
      return false;
    }

    return destinationDeviceType === deviceType;
  };

  handleIsDraggable = deviceType => {
    const { directoryLists, mtpDevice } = this.props;
    const { queue } = directoryLists[deviceType];
    const { selected } = queue;

    return selected.length > 0 && mtpDevice.isAvailable;
  };

  setFilesDrag({ ...args }) {
    const { handleSetFilesDrag } = this.props;

    handleSetFilesDrag({ ...args });
  }

  clearFilesDrag() {
    const { handleClearFilesDrag } = this.props;

    handleClearFilesDrag();
  }

  handleNewFolderEditDialog = async ({ ...args }) => {
    const {
      deviceType,
      handleNewFolder,
      hideHiddenFiles,
      currentBrowsePath,
      mtpStoragesListSelected
    } = this.props;

    // eslint-disable-next-line react/destructuring-assignment
    const { data } = this.state.toggleDialog.newFolder;
    const { confirm, textFieldValue: newFolderName } = args;
    const targetAction = 'newFolder';

    if (!confirm || newFolderName === null) {
      this.clearEditDialog(targetAction);
      return null;
    }

    if (newFolderName.trim() === '' || /[/\\?%*:|"<>]/g.test(newFolderName)) {
      this.handleErrorsEditDialog(
        {
          toggle: true,
          message: `Error: Illegal characters.`
        },
        targetAction
      );
      return null;
    }

    const newFolderPath = sanitizePath(`${data.path}/${newFolderName}`);

    if (
      await checkFileExists(newFolderPath, deviceType, mtpStoragesListSelected)
    ) {
      this.handleErrorsEditDialog(
        {
          toggle: true,
          message: `Error: The name "${newFolderName}" is already taken.`
        },
        targetAction
      );
      return null;
    }

    handleNewFolder(
      {
        newFolderPath,
        deviceType
      },
      {
        filePath: currentBrowsePath[deviceType],
        ignoreHidden: hideHiddenFiles[deviceType]
      }
    );

    this.clearEditDialog(targetAction);
  };

  _handlePaste = async () => {
    const {
      deviceType,
      currentBrowsePath,
      mtpStoragesListSelected,
      fileTransferClipboard,
      handleThrowError
    } = this.props;
    let { queue } = fileTransferClipboard;
    const destinationFolder = currentBrowsePath[deviceType];
    let invalidFileNameFlag = false;

    queue = queue.map(a => {
      const _baseName = baseName(a);
      const fullPath = `${destinationFolder}/${_baseName}`;
      if (fullPath.trim() === '' || /[\\:]/g.test(fullPath)) {
        invalidFileNameFlag = true;
      }

      return fullPath;
    });

    if (invalidFileNameFlag) {
      handleThrowError({
        message: `Invalid file name in the path. \\: are not allowed.`
      });
      return null;
    }

    if (await checkFileExists(queue, deviceType, mtpStoragesListSelected)) {
      this.handleTogglePasteConfirmDialog(true);
      return null;
    }

    this.handlePasteConfirmDialog(true);
  };

  handlePasteConfirmDialog = confirm => {
    const {
      deviceType,
      hideHiddenFiles,
      currentBrowsePath,
      mtpStoragesListSelected,
      handlePaste,
      fileTransferClipboard
    } = this.props;
    const destinationFolder = currentBrowsePath[deviceType];

    this.handleTogglePasteConfirmDialog(false);

    if (!confirm) {
      return null;
    }

    handlePaste(
      {
        destinationFolder,
        mtpStoragesListSelected,
        fileTransferClipboard
      },
      {
        filePath: destinationFolder,
        ignoreHidden: hideHiddenFiles[deviceType]
      },
      deviceType
    );
  };

  _handleBreadcrumbPathClick = ({ ...args }) => {
    const { handleFetchDirList, hideHiddenFiles, deviceType } = this.props;
    const { path } = args;

    handleFetchDirList(
      {
        filePath: path,
        ignoreHidden: hideHiddenFiles[deviceType]
      },
      deviceType
    );
  };

  _handleRequestSort = (deviceType, property) => {
    const { directoryLists, handleRequestSort } = this.props;
    const orderBy = property;
    const { orderBy: _orderBy, order: _order } = directoryLists[deviceType];
    let order = 'asc';

    if (_orderBy === property && _order === 'asc') {
      order = 'desc';
    }

    handleRequestSort({ order, orderBy }, deviceType);
  };

  _handleSelectAllClick = (deviceType, event) => {
    const { directoryLists, handleSelectAllClick } = this.props;
    const selected =
      directoryLists[deviceType].nodes.map(item => item.path) || [];
    const isChecked = event.target.checked;

    handleSelectAllClick({ selected }, isChecked, deviceType);
  };

  _handleTableClick = (path, deviceType) => {
    const { directoryLists, handleTableClick } = this.props;

    const { selected } = directoryLists[deviceType].queue;
    const selectedIndex = selected.indexOf(path);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, path);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    handleTableClick({ selected: newSelected }, deviceType);
  };

  handleTableDoubleClick = (item, deviceType) => {
    const { isFolder, path } = item;

    if (!isFolder) {
      if (deviceType === DEVICES_TYPE_CONST.local) {
        shell.openItem(path);
      }
      return null;
    }

    this._fetchDirList({
      path,
      deviceType
    });
  };

  tableSort = ({ ...args }) => {
    const { nodes, order, orderBy } = args;

    if (typeof nodes === 'undefined' || !nodes.length < 0) {
      return [];
    }

    if (order === 'asc') {
      return lodashSortBy(nodes, [
        value => this._lodashSortConstraints({ value, orderBy })
      ]);
    }
    return lodashSortBy(nodes, [
      value => this._lodashSortConstraints({ value, orderBy })
    ]).reverse();
  };

  _lodashSortConstraints = ({ value, orderBy }) => {
    if (orderBy === 'size' && value.isFolder) {
      return 0;
    }

    const item = value[orderBy];
    let _primer = null;

    if (isNumber(item)) {
      if (isInt(item)) {
        _primer = parseInt(item, 10);
      } else if (isFloat) {
        _primer = parseFloat(item);
      }
    }

    if (_primer === null) {
      if (!value.isFolder) {
        const _pathInfo = pathInfo(item, value.isFolder);

        _primer = _pathInfo.name.toLowerCase();
      } else {
        _primer = item.toLowerCase();
      }
    }

    return _primer;
  };

  render() {
    const {
      deviceType,
      hideColList,
      currentBrowsePath,
      directoryLists,
      fileTransferProgess,
      mtpDevice,
      filesDrag,
      fileExplorerListingType
    } = this.props;
    const { toggleDialog, togglePasteConfirmDialog } = this.state;
    const { rename, newFolder } = toggleDialog;
    const togglePasteDialog =
      deviceType === DEVICES_TYPE_CONST.mtp && fileTransferProgess.toggle;
    const renameSecondaryText =
      deviceType === DEVICES_TYPE_CONST.mtp
        ? `Every MTP device does not support the Rename feature.`
        : ``;

    return (
      <React.Fragment>
        <TextFieldEditDialog
          titleText={`Rename a ${
            rename.data.isFolder ? `folder` : `file`
          } on your ${DEVICES_LABEL[deviceType]}?`}
          bodyText={`Path: ${rename.data.path || ''}`}
          secondaryText={`${renameSecondaryText}`}
          trigger={rename.toggle}
          defaultValue={rename.data.name || ''}
          label={rename.data.isFolder ? `New folder name` : `New file name`}
          id="renameDialog"
          required
          multiline={false}
          fullWidthDialog
          maxWidthDialog="sm"
          fullWidthTextField
          autoFocus
          onClickHandler={this.handleRenameEditDialog}
          btnPositiveText="Rename"
          btnNegativeText="Cancel"
          errors={rename.errors}
        />

        <TextFieldEditDialog
          titleText={`Create a new folder on your ${DEVICES_LABEL[deviceType]}`}
          bodyText={`Path: ${newFolder.data.path || ''}`}
          trigger={newFolder.toggle}
          defaultValue=""
          label="New folder name"
          id="newFolderDialog"
          required
          multiline={false}
          fullWidthDialog
          maxWidthDialog="sm"
          fullWidthTextField
          autoFocus
          onClickHandler={this.handleNewFolderEditDialog}
          btnPositiveText="Create"
          btnNegativeText="Cancel"
          errors={newFolder.errors}
        />

        <ProgressBarDialog
          titleText="Transferring files..."
          bodyText1={`${
            fileTransferProgess.bodyText1 ? fileTransferProgess.bodyText1 : ''
          }`}
          bodyText2={`${
            fileTransferProgess.bodyText2 ? fileTransferProgess.bodyText2 : ''
          }`}
          trigger={togglePasteDialog}
          fullWidthDialog
          maxWidthDialog="sm"
          onClickHandler={this.handleNewFolderEditDialog}
          variant="determinate"
          helpText="In case the progress bar freezes while transferring the files, restart the app and reconnect the device. This is a well known Android MTP bug."
          progressValue={fileTransferProgess.percentage}
        />

        <ConfirmDialog
          fullWidthDialog
          maxWidthDialog="xs"
          bodyText="Replace and merge the existing items?"
          trigger={togglePasteConfirmDialog}
          onClickHandler={this.handlePasteConfirmDialog}
        />

        <FileExplorerBodyRender
          deviceType={deviceType}
          fileExplorerListingType={fileExplorerListingType}
          hideColList={hideColList}
          currentBrowsePath={currentBrowsePath}
          directoryLists={directoryLists}
          mtpDevice={mtpDevice}
          filesDrag={filesDrag}
          tableSort={this.tableSort}
          OnHoverDropZoneActivate={this.handleOnHoverDropZoneActivate}
          onFilesDragOver={this.handleFilesDragOver}
          onFilesDragEnd={this.handleFilesDragEnd}
          onTableDrop={this.handleTableDrop}
          onBreadcrumbPathClick={this._handleBreadcrumbPathClick}
          onSelectAllClick={this._handleSelectAllClick}
          onRequestSort={this._handleRequestSort}
          onContextMenuClick={this._handleContextMenuClick}
          onTableDoubleClick={this.handleTableDoubleClick}
          onTableClick={this._handleTableClick}
          onIsDraggable={this.handleIsDraggable}
          onDragStart={this.handleFilesDragStart}
        />
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      handleThrowError: ({ ...args }) => (_, getState) => {
        dispatch(throwAlert({ ...args }));
      },

      handleRequestSort: ({ ...args }, deviceType) => (_, getState) => {
        dispatch(setSortingDirLists({ ...args }, deviceType));
      },

      handleSelectAllClick: ({ selected }, isChecked, deviceType) => (
        _,
        getState
      ) => {
        if (isChecked) {
          dispatch(
            setSelectedDirLists(
              {
                selected
              },
              deviceType
            )
          );
          return;
        }

        dispatch(setSelectedDirLists({ selected: [] }, deviceType));
      },

      handleTableClick: ({ selected }, deviceType) => (_, getState) => {
        dispatch(setSelectedDirLists({ selected }, deviceType));
      },

      handleFetchMtpStorageOptions: ({ ...args }, deviceType) => (
        _,
        getState
      ) => {
        dispatch(
          setMtpStorageOptions(
            { ...args },
            deviceType,
            {
              changeMtpStorageIdsOnlyOnDeviceChange: false,
              mtpStoragesList: {}
            },
            getState
          )
        );
      },

      handleFetchDirList: ({ ...args }, deviceType) => (_, getState) => {
        dispatch(fetchDirList({ ...args }, deviceType, getState));
      },

      handleRenameFile: (
        { oldFilePath, newFilePath, deviceType },
        { ...fetchDirListArgs }
      ) => async (_, getState) => {
        try {
          switch (deviceType) {
            case DEVICES_TYPE_CONST.local:
              const {
                error: localError,
                stderr: localStderr,
                data: localData
              } = await renameLocalFiles({
                oldFilePath,
                newFilePath
              });

              dispatch(
                processLocalOutput({
                  deviceType,
                  error: localError,
                  stderr: localStderr,
                  data: localData,
                  callback: () => {
                    dispatch(
                      fetchDirList(
                        { ...fetchDirListArgs },
                        deviceType,
                        getState
                      )
                    );
                  }
                })
              );
              break;
            case DEVICES_TYPE_CONST.mtp:
              const mtpStoragesListSelected = getMtpStoragesListSelected(
                getState().Home
              );
              const {
                error: mtpError,
                stderr: mtpStderr,
                data: mtpData
              } = await renameMtpFiles({
                oldFilePath,
                newFilePath,
                mtpStoragesListSelected
              });

              dispatch(
                processMtpOutput({
                  deviceType,
                  error: mtpError,
                  stderr: mtpStderr,
                  data: mtpData,
                  callback: () => {
                    dispatch(
                      fetchDirList(
                        { ...fetchDirListArgs },
                        deviceType,
                        getState
                      )
                    );
                  }
                })
              );
              break;
            default:
              break;
          }
        } catch (e) {
          log.error(e);
        }
      },
      handleNewFolder: (
        { newFolderPath, deviceType },
        { ...fetchDirListArgs }
      ) => async (_, getState) => {
        try {
          switch (deviceType) {
            case DEVICES_TYPE_CONST.local:
              const {
                error: localError,
                stderr: localStderr,
                data: localData
              } = await newLocalFolder({
                newFolderPath
              });

              dispatch(
                processLocalOutput({
                  deviceType,
                  error: localError,
                  stderr: localStderr,
                  data: localData,
                  callback: () => {
                    dispatch(
                      fetchDirList(
                        { ...fetchDirListArgs },
                        deviceType,
                        getState
                      )
                    );
                  }
                })
              );
              break;
            case DEVICES_TYPE_CONST.mtp:
              const mtpStoragesListSelected = getMtpStoragesListSelected(
                getState().Home
              );
              const {
                error: mtpError,
                stderr: mtpStderr,
                data: mtpData
              } = await newMtpFolder({
                newFolderPath,
                mtpStoragesListSelected
              });

              dispatch(
                processMtpOutput({
                  deviceType,
                  error: mtpError,
                  stderr: mtpStderr,
                  data: mtpData,
                  callback: () => {
                    dispatch(
                      fetchDirList(
                        { ...fetchDirListArgs },
                        deviceType,
                        getState
                      )
                    );
                  }
                })
              );
              break;
            default:
              break;
          }
        } catch (e) {
          log.error(e);
        }
      },

      handleCopy: ({ selected, deviceType }) => async (_, getState) => {
        try {
          dispatch(
            setFileTransferClipboard({
              queue: selected || [],
              source: deviceType
            })
          );

          dispatch(setSelectedDirLists({ selected: [] }, deviceType));
        } catch (e) {
          log.error(e);
        }
      },

      handlePaste: ({ ...pasteArgs }, { ...fetchDirListArgs }, deviceType) => (
        _,
        getState
      ) => {
        try {
          switch (deviceType) {
            case DEVICES_TYPE_CONST.local:
              pasteFiles(
                { ...pasteArgs },
                { ...fetchDirListArgs },
                'mtpToLocal',
                deviceType,
                dispatch,
                getState,
                getCurrentWindow
              );
              break;
            case DEVICES_TYPE_CONST.mtp:
              pasteFiles(
                { ...pasteArgs },
                { ...fetchDirListArgs },
                'localtoMtp',
                deviceType,
                dispatch,
                getState,
                getCurrentWindow
              );
              break;
            default:
              break;
          }
        } catch (e) {
          log.error(e);
        }
      },

      handleSetFilesDrag: ({ ...args }) => (_, getState) => {
        try {
          dispatch(setFilesDrag({ ...args }));
        } catch (e) {
          log.error(e);
        }
      },

      handleClearFilesDrag: () => (_, getState) => {
        try {
          dispatch(clearFilesDrag());
        } catch (e) {
          log.error(e);
        }
      }
    },
    dispatch
  );

const mapStateToProps = (state, props) => {
  return {
    currentBrowsePath: makeCurrentBrowsePath(state),
    mtpDevice: makeMtpDevice(state),
    directoryLists: makeDirectoryLists(state),
    isLoading: makeIsLoading(state),
    hideHiddenFiles: makeHideHiddenFiles(state),
    contextMenuList: makeContextMenuList(state),
    mtpStoragesListSelected: makeMtpStoragesListSelected(state),
    fileTransferClipboard: makeFileTransferClipboard(state),
    fileTransferProgess: makeFileTransferProgess(state),
    filesDrag: makeFilesDrag(state),
    fileExplorerListingType: makeFileExplorerListingType(state)
  };
};

export default withReducer('Home', reducers)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(FileExplorer)
);
