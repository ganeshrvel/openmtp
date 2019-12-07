'use strict';

/* eslint no-case-declarations: off */

import React, { Component, Fragment } from 'react';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import { remote, ipcRenderer, shell } from 'electron';
import lodashSortBy from 'lodash/sortBy';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { log } from '@Log';
import { styles } from '../styles/FileExplorer';
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
  clearFilesDrag,
  setFocussedFileExplorerDeviceType
} from '../actions';
import {
  makeDirectoryLists,
  makeCurrentBrowsePath,
  makeMtpDevice,
  makeContextMenuList,
  makeMtpStoragesListSelected,
  makeFileTransferClipboard,
  makeFileTransferProgess,
  makeFilesDrag,
  makeFocussedFileExplorerDeviceType
} from '../selectors';
import {
  makeEnableStatusBar,
  makeFileExplorerListingType,
  makeHideHiddenFiles
} from '../../Settings/selectors';
import {
  DEVICES_LABEL,
  DEVICES_TYPE_CONST,
  DONATE_PAYPAL_URL
} from '../../../constants';
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
  isArray,
  isFloat,
  isInt,
  isNumber,
  removeArrayDuplicates,
  undefinedOrNull
} from '../../../utils/funcs';
import { getMainWindowRendererProcess } from '../../../utils/windowHelper';
import { throwAlert } from '../../Alerts/actions';
import { imgsrc } from '../../../utils/imgsrc';
import FileExplorerBodyRender from './FileExplorerBodyRender';
import { openExternalUrl } from '../../../utils/url';
import { APP_GITHUB_URL } from '../../../constants/meta';
import {
  fbShareUrl,
  redditShareUrl,
  twitterShareUrl
} from '../../../templates/socialMediaShareBtns';

const { Menu, getCurrentWindow } = remote;
const _mainWindowRendererProcess = getMainWindowRendererProcess();
const filesDragGhostImg = new Image(0, 0);
filesDragGhostImg.src = imgsrc('FileExplorer/copy.svg');
let allowFileDropFlag = false;
let multipleSelectDirection = null;

const socialMediaShareBtnsList = [
  {
    enabled: true,
    label: 'Find us on GitHub',
    imgSrc: 'SocialMediaShare/github.svg',
    url: APP_GITHUB_URL,
    invert: false
  },
  {
    enabled: true,
    label: 'Share it on Twitter',
    imgSrc: 'SocialMediaShare/twitter.svg',
    url: twitterShareUrl,
    invert: false
  },
  {
    enabled: true,
    label: 'Share it on Facebook',
    imgSrc: 'SocialMediaShare/facebook.svg',
    url: fbShareUrl,
    invert: false
  },
  {
    enabled: true,
    label: 'Share it on Reddit',
    imgSrc: 'SocialMediaShare/reddit.svg',
    url: redditShareUrl,
    invert: false
  },
  {
    enabled: true,
    label: 'Buy me a Coffee',
    imgSrc: 'SocialMediaShare/paypal.svg',
    url: DONATE_PAYPAL_URL,
    invert: false
  }
];

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
      },
      directoryGeneratedTime: Date.now()
    };
    this.state = {
      ...this.initialState
    };

    this.electronMenu = new Menu();

    this.keyedAcceleratorList = {
      shift: false
    };
  }

  componentWillMount() {
    const {
      currentBrowsePath,
      deviceType,
      actionCreateFetchMtpStorageOptions,
      hideHiddenFiles
    } = this.props;

    if (deviceType === DEVICES_TYPE_CONST.mtp) {
      actionCreateFetchMtpStorageOptions(
        {
          filePath: currentBrowsePath[deviceType],
          ignoreHidden: hideHiddenFiles[deviceType]
        },
        deviceType
      );
    } else {
      this._handleFetchDirList({
        path: currentBrowsePath[deviceType],
        deviceType
      });
    }
  }

  componentDidMount() {
    this.registerAccelerators();
    this.registerAppUpdate();
  }

  componentWillReceiveProps({ directoryLists: nextDirectoryLists }) {
    const { deviceType, directoryLists } = this.props;

    const { nodes: prevDirectoryNodes } = directoryLists[deviceType];
    const { nodes: nextDirectoryNodes } = nextDirectoryLists[deviceType];

    if (nextDirectoryNodes !== prevDirectoryNodes) {
      this._handleDirectoryGeneratedTime();
    }
  }

  componentWillUnmount() {
    this.deregisterAccelerators();

    _mainWindowRendererProcess.webContents.removeListener(
      'fileExplorerToolbarActionCommunication',
      () => {}
    );
    ipcRenderer.removeListener('isFileTransferActiveSeek', () => {});
    ipcRenderer.removeListener('isFileTransferActiveReply', () => {});
  }

  registerAccelerators = () => {
    document.addEventListener(
      'keydown',
      this._handleAccelerator.bind(this, true)
    );
    document.addEventListener(
      'keyup',
      this._handleAccelerator.bind(this, false)
    );
  };

  deregisterAccelerators = () => {
    document.removeEventListener(
      'keydown',
      this._handleAccelerator.bind(this, false)
    );
    document.removeEventListener(
      'keyup',
      this._handleAccelerator.bind(this, false)
    );
  };

  registerAppUpdate = () => {
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
  };

  _handleAccelerator = (pressed, event) => {
    if (undefinedOrNull(event)) {
      return;
    }

    switch (event.key) {
      case 'Shift':
      case 'shift':
      case 'Meta':
      case 'meta':
        this.keyedAcceleratorList = {
          ...this.keyedAcceleratorList,
          shift: pressed
        };
        break;
      default:
        break;
    }
  };

  _handleFetchDirList({ ...args }) {
    const { actionCreateFetchDirList, hideHiddenFiles } = this.props;
    const { path, deviceType } = args;

    actionCreateFetchDirList(
      {
        filePath: path,
        ignoreHidden: hideHiddenFiles[deviceType]
      },
      deviceType
    );
  }

  lastSelectedNode = (nodes, selected) => {
    let _return = {
      index: -1,
      item: []
    };

    nodes.filter((item, index) => {
      if (
        undefinedOrNull(selected) ||
        !isArray(selected) ||
        selected.length < 1
      ) {
        return null;
      }

      if (selected[selected.length - 1] !== item.path) {
        return null;
      }

      _return = {
        index,
        item
      };

      return _return;
    });

    return _return;
  };

  lastSelectedNodeOfTableSort = (nodes, selected, reverse = false) => {
    let _return = {
      index: -1,
      item: []
    };

    nodes.filter((item, index) => {
      if (
        undefinedOrNull(selected) ||
        !isArray(selected) ||
        selected.length < 1
      ) {
        return null;
      }

      for (let i = 0; i < selected.length; i += 1) {
        if (selected[i] === item.path) {
          if (reverse) {
            if (_return.index < 0) {
              _return = {
                index,
                item
              };
              return _return;
            }
          } else {
            _return = {
              index,
              item
            };
          }
        }
      }

      return _return;
    });

    return _return;
  };

  /* activate actions using keyboard */
  _handleAcceleratorActivation = ({ type, data }) => {
    const { focussedFileExplorerDeviceType } = this.props;
    const {
      mtpDevice,
      directoryLists,
      actionCreateCopy,
      fileTransferClipboard,
      currentBrowsePath,
      fileExplorerListingType
    } = this.props;
    const { tableData, deviceType, event } = data;
    const { queue, nodes, order, orderBy } = directoryLists[deviceType];

    // eslint-disable-next-line prefer-destructuring
    const selected = queue.selected;
    const _currentBrowsePath = currentBrowsePath[deviceType];
    const _focussedFileExplorerDeviceType =
      focussedFileExplorerDeviceType.value;
    const _lastSelectedNode = this.lastSelectedNode(nodes, selected);

    let _tableSort = [];
    let _lastSelectedNodeOfTableSort = {};
    let _lastSelectedNodeOfTableSortReverse = {};
    let nextPathToNavigate = {};
    let navigationInReverse = false;

    if (_focussedFileExplorerDeviceType !== deviceType) {
      return null;
    }

    if (
      _focussedFileExplorerDeviceType === DEVICES_TYPE_CONST.mtp &&
      !mtpDevice.isAvailable &&
      type !== 'refresh'
    ) {
      return null;
    }

    switch (type) {
      case 'navigationLeft':
      case 'navigationRight':
      case 'navigationUp':
      case 'navigationDown':
      case 'multipleSelectLeft':
      case 'multipleSelectUp':
      case 'multipleSelectRight':
      case 'multipleSelectDown':
        _tableSort = this.tableSort({
          nodes,
          order,
          orderBy
        });

        _lastSelectedNodeOfTableSort = this.lastSelectedNodeOfTableSort(
          _tableSort,
          selected
        );
        break;

      default:
        break;
    }

    switch (type) {
      case 'newFolder':
        this._handleToggleDialogBox(
          { toggle: true, data: { ...tableData } },
          type
        );
        break;

      case 'copy':
        if (selected.length < 1) {
          break;
        }

        actionCreateCopy({
          selected,
          deviceType
        });
        break;

      case 'copyToQueue':
        if (selected.length < 1) {
          break;
        }

        actionCreateCopy({
          selected,
          deviceType,
          toQueue: true
        });
        break;

      case 'paste':
        if (
          fileTransferClipboard.queue.length < 1 ||
          fileTransferClipboard.source === deviceType
        ) {
          break;
        }

        this._handlePaste();
        break;

      case 'delete':
        if (selected.length < 1) {
          break;
        }

        _mainWindowRendererProcess.webContents.send(
          'fileExplorerToolbarActionCommunication',
          {
            type,
            deviceType: _focussedFileExplorerDeviceType
          }
        );
        break;

      case 'refresh':
        _mainWindowRendererProcess.webContents.send(
          'fileExplorerToolbarActionCommunication',
          {
            type,
            deviceType: _focussedFileExplorerDeviceType
          }
        );
        break;

      case 'up':
        if (_currentBrowsePath === '/') {
          break;
        }

        _mainWindowRendererProcess.webContents.send(
          'fileExplorerToolbarActionCommunication',
          {
            type,
            deviceType: _focussedFileExplorerDeviceType
          }
        );
        break;

      case 'selectAll':
        this._handleSelectAllClick(deviceType);
        break;

      case 'rename':
        if (selected.length !== 1) {
          break;
        }

        this._handleToggleDialogBox(
          { toggle: true, data: { ..._lastSelectedNode.item } },
          'rename'
        );
        break;

      case 'open':
        if (selected.length !== 1) {
          break;
        }
        this._handleTableDoubleClick(_lastSelectedNode.item, deviceType);
        break;

      case 'navigationLeft':
      case 'navigationUp':
        if (nodes.length < 1) {
          break;
        }

        if (
          type === 'navigationLeft' &&
          fileExplorerListingType[deviceType] === 'list'
        ) {
          break;
        } else if (
          type === 'navigationUp' &&
          fileExplorerListingType[deviceType] === 'grid'
        ) {
          break;
        }

        nextPathToNavigate =
          _tableSort[
            _lastSelectedNodeOfTableSort.index - 1 < 0
              ? 0
              : _lastSelectedNodeOfTableSort.index - 1
          ];
        if (undefinedOrNull(nextPathToNavigate)) {
          break;
        }

        this._handleTableClick(
          nextPathToNavigate.path,
          deviceType,
          event,
          true
        );
        break;

      case 'navigationRight':
      case 'navigationDown':
        if (nodes.length < 1) {
          break;
        }

        if (
          type === 'navigationRight' &&
          fileExplorerListingType[deviceType] === 'list'
        ) {
          break;
        } else if (
          type === 'navigationDown' &&
          fileExplorerListingType[deviceType] === 'grid'
        ) {
          break;
        }

        nextPathToNavigate = _tableSort[_lastSelectedNodeOfTableSort.index + 1];
        if (undefinedOrNull(nextPathToNavigate)) {
          break;
        }

        this._handleTableClick(
          nextPathToNavigate.path,
          deviceType,
          event,
          true
        );
        break;

      case 'multipleSelectLeft':
      case 'multipleSelectUp':
        if (nodes.length < 1) {
          break;
        }

        if (
          type === 'multipleSelectLeft' &&
          fileExplorerListingType[deviceType] === 'list'
        ) {
          break;
        } else if (
          type === 'multipleSelectUp' &&
          fileExplorerListingType[deviceType] === 'grid'
        ) {
          break;
        }

        navigationInReverse =
          ['multipleSelectRight', 'multipleSelectDown'].indexOf(
            multipleSelectDirection
          ) !== -1 && selected.length > 1;

        if (navigationInReverse) {
          nextPathToNavigate =
            _tableSort[
              _lastSelectedNodeOfTableSort.index < 0
                ? 0
                : _lastSelectedNodeOfTableSort.index
            ];
        } else {
          _lastSelectedNodeOfTableSortReverse = this.lastSelectedNodeOfTableSort(
            _tableSort,
            selected,
            true
          );

          nextPathToNavigate =
            _tableSort[
              _lastSelectedNodeOfTableSortReverse.index - 1 < 0
                ? 0
                : _lastSelectedNodeOfTableSortReverse.index - 1
            ];
          multipleSelectDirection = type;
        }

        if (
          undefinedOrNull(nextPathToNavigate) ||
          _lastSelectedNodeOfTableSort.index <= 0 ||
          _lastSelectedNodeOfTableSortReverse.index <= 0
        ) {
          break;
        }

        this._handleTableClick(
          nextPathToNavigate.path,
          deviceType,
          event,
          false
        );

        break;

      case 'multipleSelectRight':
      case 'multipleSelectDown':
        if (nodes.length < 1) {
          break;
        }

        if (
          type === 'multipleSelectRight' &&
          fileExplorerListingType[deviceType] === 'list'
        ) {
          break;
        } else if (
          type === 'multipleSelectDown' &&
          fileExplorerListingType[deviceType] === 'grid'
        ) {
          break;
        }

        navigationInReverse =
          ['multipleSelectLeft', 'multipleSelectUp'].indexOf(
            multipleSelectDirection
          ) !== -1 && selected.length > 1;

        if (navigationInReverse) {
          _lastSelectedNodeOfTableSortReverse = this.lastSelectedNodeOfTableSort(
            _tableSort,
            selected,
            true
          );

          nextPathToNavigate =
            _tableSort[_lastSelectedNodeOfTableSortReverse.index];
        } else {
          multipleSelectDirection = type;
          nextPathToNavigate =
            _tableSort[_lastSelectedNodeOfTableSort.index + 1];
        }

        if (undefinedOrNull(nextPathToNavigate)) {
          break;
        }

        this._handleTableClick(
          nextPathToNavigate.path,
          deviceType,
          event,
          false
        );

        break;

      default:
        break;
    }
  };

  _handleFocussedFileExplorerDeviceType = (toggle, deviceType) => {
    const {
      actionCreateFocussedFileExplorerDeviceType,
      focussedFileExplorerDeviceType
    } = this.props;

    if (focussedFileExplorerDeviceType.value === deviceType) {
      return null;
    }

    let _focussedFileExplorerDeviceType = {};

    if (toggle) {
      _focussedFileExplorerDeviceType = {
        accelerator: deviceType,
        value: deviceType
      };
    } else {
      _focussedFileExplorerDeviceType = {
        onClick: deviceType,
        value: deviceType
      };
    }

    actionCreateFocussedFileExplorerDeviceType({
      ..._focussedFileExplorerDeviceType
    });
  };

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
        case 'copyToQueue':
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

  /* activate actions using mouse */
  _handleContextMenuListActions = ({ ...args }) => {
    const { deviceType, directoryLists, actionCreateCopy } = this.props;

    Object.keys(args).map(a => {
      const item = args[a];
      switch (a) {
        case 'rename':
          this._handleToggleDialogBox(
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
          const selectedItemsToCopy = directoryLists[deviceType].queue.selected;
          actionCreateCopy({ selected: selectedItemsToCopy, deviceType });
          break;

        case 'copyToQueue':
          // eslint-disable-next-line prefer-destructuring
          const selectedItemsToCopyToQueue =
            directoryLists[deviceType].queue.selected;
          actionCreateCopy({
            selected: selectedItemsToCopyToQueue,
            deviceType,
            toQueue: true
          });
          break;

        case 'paste':
          this._handlePaste();
          break;

        case 'newFolder':
          this._handleToggleDialogBox(
            {
              toggle: true,
              data: {
                ...item.data
              }
            },
            'newFolder'
          );
          break;

        case 'cancel':
          break;

        default:
          break;
      }

      return a;
    });
  };

  _handleToggleDialogBox = ({ ...args }, targetAction) => {
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

  _handleRenameEditDialog = async ({ ...args }) => {
    const {
      deviceType,
      actionCreateRenameFile,
      hideHiddenFiles,
      currentBrowsePath,
      mtpStoragesListSelected
    } = this.props;

    // eslint-disable-next-line react/destructuring-assignment
    const { data } = this.state.toggleDialog.rename;
    const { confirm, textFieldValue: newFileName } = args;
    const targetAction = 'rename';

    if (!confirm || newFileName === null) {
      this._handleClearEditDialog(targetAction);
      return null;
    }

    if (newFileName.trim() === '' || /[/\\?%*:|"<>]/g.test(newFileName)) {
      this._handleErrorsEditDialog(
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
      this._handleClearEditDialog(targetAction);
      return null;
    }

    if (
      await checkFileExists(newFilePath, deviceType, mtpStoragesListSelected)
    ) {
      this._handleErrorsEditDialog(
        {
          toggle: true,
          message: `Error: The name "${newFileName}" is already taken.`
        },
        targetAction
      );
      return null;
    }
    actionCreateRenameFile(
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

    this._handleClearEditDialog(targetAction);
  };

  _handleErrorsEditDialog = ({ ...args }, targetAction) => {
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

  _handleClearEditDialog = targetAction => {
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

  _handleTogglePasteConfirmDialog = status => {
    this.setState({
      togglePasteConfirmDialog: status
    });
  };

  _handleFilesDragStart = (e, { sourceDeviceType }) => {
    this._handleSetFilesDrag({
      sourceDeviceType,
      destinationDeviceType: null,
      enter: false,
      lock: false
    });

    e.dataTransfer.setDragImage(filesDragGhostImg, 0, 0);
  };

  _handleFilesDragOver = (e, { destinationDeviceType }) => {
    const { filesDrag } = this.props;
    e.preventDefault();
    e.stopPropagation();

    if (destinationDeviceType === filesDrag.sourceDeviceType) {
      if (filesDrag.sameSourceDestinationLock) {
        return null;
      }

      allowFileDropFlag = false;
      this._handleSetFilesDrag({
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
    this._handleSetFilesDrag({
      sourceDeviceType: filesDrag.sourceDeviceType,
      destinationDeviceType,
      enter: true,
      lock: true,
      sameSourceDestinationLock: false
    });
  };

  _handleFilesDragEnd = () => {
    this._handleClearFilesDrag();
  };

  _handleTableDrop = () => {
    const { directoryLists, actionCreateCopy, filesDrag } = this.props;
    const { sourceDeviceType, destinationDeviceType } = filesDrag;

    if (
      !allowFileDropFlag ||
      destinationDeviceType === null ||
      destinationDeviceType === null ||
      sourceDeviceType === destinationDeviceType
    ) {
      return null;
    }

    // eslint-disable-next-line prefer-destructuring
    const selected = directoryLists[sourceDeviceType].queue.selected;
    actionCreateCopy({ selected, deviceType: sourceDeviceType });

    setTimeout(() => {
      this._handlePaste();
      this._handleClearFilesDrag();
    }, 200);
  };

  _handleOnHoverDropZoneActivate = deviceType => {
    const { filesDrag, mtpDevice } = this.props;
    const { sourceDeviceType, destinationDeviceType } = filesDrag;

    if (sourceDeviceType === destinationDeviceType || !mtpDevice.isAvailable) {
      return false;
    }

    return destinationDeviceType === deviceType;
  };

  _handleIsDraggable = deviceType => {
    const { directoryLists, mtpDevice } = this.props;
    const { queue } = directoryLists[deviceType];
    const { selected } = queue;

    return selected.length > 0 && mtpDevice.isAvailable;
  };

  _handleSetFilesDrag({ ...args }) {
    const { actionCreateSetFilesDrag } = this.props;

    actionCreateSetFilesDrag({ ...args });
  }

  _handleClearFilesDrag() {
    const { actionCreateClearFilesDrag } = this.props;

    actionCreateClearFilesDrag();
  }

  _handleNewFolderEditDialog = async ({ ...args }) => {
    const {
      deviceType,
      actionCreateNewFolder,
      hideHiddenFiles,
      currentBrowsePath,
      mtpStoragesListSelected
    } = this.props;

    // eslint-disable-next-line react/destructuring-assignment
    const { data } = this.state.toggleDialog.newFolder;
    const { confirm, textFieldValue: newFolderName } = args;
    const targetAction = 'newFolder';

    if (!confirm) {
      this._handleClearEditDialog(targetAction);
      return null;
    }

    if (newFolderName === null || newFolderName.trim() === '') {
      this._handleErrorsEditDialog(
        {
          toggle: true,
          message: `Error: Folder name cannot be empty.`
        },
        targetAction
      );
      return null;
    }

    if (/[/\\?%*:|"<>]/g.test(newFolderName)) {
      this._handleErrorsEditDialog(
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
      this._handleErrorsEditDialog(
        {
          toggle: true,
          message: `Error: The name "${newFolderName}" is already taken.`
        },
        targetAction
      );
      return null;
    }

    actionCreateNewFolder(
      {
        newFolderPath,
        deviceType
      },
      {
        filePath: currentBrowsePath[deviceType],
        ignoreHidden: hideHiddenFiles[deviceType]
      }
    );

    this._handleClearEditDialog(targetAction);
  };

  _handlePaste = async () => {
    const {
      deviceType,
      currentBrowsePath,
      mtpStoragesListSelected,
      fileTransferClipboard,
      actionCreateThrowError
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
      actionCreateThrowError({
        message: `Invalid file name in the path. \\: characters are not allowed.`
      });
      return null;
    }

    if (await checkFileExists(queue, deviceType, mtpStoragesListSelected)) {
      this._handleTogglePasteConfirmDialog(true);
      return null;
    }

    this._handlePasteConfirmDialog(true);
  };

  _handlePasteConfirmDialog = confirm => {
    const {
      deviceType,
      hideHiddenFiles,
      currentBrowsePath,
      mtpStoragesListSelected,
      actionCreatePaste,
      fileTransferClipboard
    } = this.props;
    const destinationFolder = currentBrowsePath[deviceType];

    this._handleTogglePasteConfirmDialog(false);

    if (!confirm) {
      return null;
    }

    actionCreatePaste(
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
    const {
      actionCreateFetchDirList,
      hideHiddenFiles,
      deviceType
    } = this.props;
    const { path } = args;

    actionCreateFetchDirList(
      {
        filePath: path,
        ignoreHidden: hideHiddenFiles[deviceType]
      },
      deviceType
    );
  };

  _handleRequestSort = (deviceType, property) => {
    const { directoryLists, actionCreateRequestSort } = this.props;
    const orderBy = property;
    const { orderBy: _orderBy, order: _order } = directoryLists[deviceType];
    let order = 'asc';

    if (_orderBy === property && _order === 'asc') {
      order = 'desc';
    }

    actionCreateRequestSort({ order, orderBy }, deviceType);

    this._handleDirectoryGeneratedTime();
  };

  _handleSelectAllClick = (deviceType, event) => {
    const { directoryLists, actionCreateSelectAllClick } = this.props;
    const selected =
      directoryLists[deviceType].nodes.map(item => item.path) || [];
    let isChecked = true;

    if (event) {
      isChecked = event.target.checked;
    }

    actionCreateSelectAllClick({ selected }, isChecked, deviceType);
  };

  _handleTableClick = (
    path,
    deviceType,
    event,
    dontAppend = false,
    shiftKeyAcceleratorEnable = false
  ) => {
    if (undefinedOrNull(path)) {
      return null;
    }

    const { directoryLists, actionCreateTableClick } = this.props;
    const { selected } = directoryLists[deviceType].queue;
    const selectedIndex = selected.indexOf(path);
    let _dontAppend = dontAppend;
    let newSelected = [];

    if (shiftKeyAcceleratorEnable && this.keyedAcceleratorList.shift) {
      _dontAppend = false;
    }

    if (_dontAppend) {
      newSelected = [path];
    } else if (selectedIndex === -1) {
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

    actionCreateTableClick({ selected: newSelected }, deviceType);
  };

  _handleTableDoubleClick = (item, deviceType) => {
    const { isFolder, path } = item;

    if (!isFolder) {
      if (deviceType === DEVICES_TYPE_CONST.local) {
        shell.openItem(path);
      }
      return null;
    }

    this._handleFetchDirList({
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

  _handleDirectoryGeneratedTime = () => {
    this.setState({
      directoryGeneratedTime: Date.now()
    });
  };

  render() {
    const {
      classes: styles,
      deviceType,
      hideColList,
      currentBrowsePath,
      directoryLists,
      fileTransferProgess,
      mtpDevice,
      filesDrag,
      fileExplorerListingType,
      isStatusBarEnabled,
      fileTransferClipboard
    } = this.props;
    const {
      toggleDialog,
      togglePasteConfirmDialog,
      directoryGeneratedTime
    } = this.state;
    const { rename, newFolder } = toggleDialog;
    const togglePasteDialog =
      deviceType === DEVICES_TYPE_CONST.mtp && fileTransferProgess.toggle;
    const renameSecondaryText =
      deviceType === DEVICES_TYPE_CONST.mtp
        ? `Not all ${
            DEVICES_LABEL[DEVICES_TYPE_CONST.mtp]
          } support the rename feature.`
        : ``;

    return (
      <Fragment>
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
          onClickHandler={this._handleRenameEditDialog}
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
          onClickHandler={this._handleNewFolderEditDialog}
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
          variant="determinate"
          helpText="If the progress bar freezes while transferring the files, restart the app and reconnect the device. This is a known Android MTP bug."
          progressValue={fileTransferProgess.percentage}
        >
          <div className={styles.socialMediaShareContainer}>
            <Typography className={styles.socialMediaShareTitle}>
              Liked using the App?
            </Typography>
            <div className={styles.socialMediaShareBtnsWrapper}>
              {socialMediaShareBtnsList.map((a, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <Tooltip key={index} title={a.label}>
                  <div>
                    <IconButton
                      aria-label={a.label}
                      disabled={!a.enabled}
                      onClick={() => openExternalUrl(a.url)}
                    >
                      <img
                        className={styles.socialMediaShareBtn}
                        src={imgsrc(a.imgSrc)}
                        alt={a.label}
                      />
                    </IconButton>
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
        </ProgressBarDialog>

        <ConfirmDialog
          fullWidthDialog
          maxWidthDialog="xs"
          bodyText="Replace and merge the existing items?"
          trigger={togglePasteConfirmDialog}
          onClickHandler={this._handlePasteConfirmDialog}
        />

        <FileExplorerBodyRender
          deviceType={deviceType}
          fileExplorerListingType={fileExplorerListingType}
          hideColList={hideColList}
          currentBrowsePath={currentBrowsePath}
          directoryLists={directoryLists}
          fileTransferClipboard={fileTransferClipboard}
          mtpDevice={mtpDevice}
          filesDrag={filesDrag}
          tableSort={this.tableSort}
          isStatusBarEnabled={isStatusBarEnabled}
          directoryGeneratedTime={directoryGeneratedTime}
          OnHoverDropZoneActivate={this._handleOnHoverDropZoneActivate}
          onFilesDragOver={this._handleFilesDragOver}
          onFilesDragEnd={this._handleFilesDragEnd}
          onTableDrop={this._handleTableDrop}
          onBreadcrumbPathClick={this._handleBreadcrumbPathClick}
          onSelectAllClick={this._handleSelectAllClick}
          onRequestSort={this._handleRequestSort}
          onContextMenuClick={this._handleContextMenuClick}
          onTableDoubleClick={this._handleTableDoubleClick}
          onTableClick={this._handleTableClick}
          onIsDraggable={this._handleIsDraggable}
          onDragStart={this._handleFilesDragStart}
          onFocussedFileExplorerDeviceType={
            this._handleFocussedFileExplorerDeviceType
          }
          onAcceleratorActivation={this._handleAcceleratorActivation}
        />
      </Fragment>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      actionCreateThrowError: ({ ...args }) => (_, getState) => {
        dispatch(throwAlert({ ...args }));
      },

      actionCreateFocussedFileExplorerDeviceType: ({ ...args }) => (
        _,
        getState
      ) => {
        dispatch(setFocussedFileExplorerDeviceType({ ...args }));
      },

      actionCreateRequestSort: ({ ...args }, deviceType) => (_, getState) => {
        dispatch(setSortingDirLists({ ...args }, deviceType));
      },

      actionCreateSelectAllClick: ({ selected }, isChecked, deviceType) => (
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

      actionCreateTableClick: ({ selected }, deviceType) => (_, getState) => {
        dispatch(setSelectedDirLists({ selected }, deviceType));
      },

      actionCreateFetchMtpStorageOptions: ({ ...args }, deviceType) => (
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

      actionCreateFetchDirList: ({ ...args }, deviceType) => (_, getState) => {
        dispatch(fetchDirList({ ...args }, deviceType, getState));
      },

      actionCreateRenameFile: (
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

      actionCreateNewFolder: (
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

      actionCreateCopy: ({ selected, deviceType, toQueue = false }) => async (
        _,
        getState
      ) => {
        try {
          let queue = [];

          if (toQueue && isArray(selected) && selected.length > 0) {
            const currentClipboardQueue = getState().Home.fileTransfer.clipboard
              .queue;

            queue = [...currentClipboardQueue, ...selected];
          } else {
            queue = selected || [];
          }

          queue = removeArrayDuplicates(queue);

          dispatch(
            setFileTransferClipboard({
              queue,
              source: deviceType
            })
          );

          dispatch(setSelectedDirLists({ selected: [] }, deviceType));
        } catch (e) {
          log.error(e);
        }
      },

      actionCreatePaste: (
        { ...pasteArgs },
        { ...fetchDirListArgs },
        deviceType
      ) => (_, getState) => {
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

      actionCreateSetFilesDrag: ({ ...args }) => (_, getState) => {
        try {
          dispatch(setFilesDrag({ ...args }));
        } catch (e) {
          log.error(e);
        }
      },

      actionCreateClearFilesDrag: () => (_, getState) => {
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
    hideHiddenFiles: makeHideHiddenFiles(state),
    isStatusBarEnabled: makeEnableStatusBar(state),
    contextMenuList: makeContextMenuList(state),
    mtpStoragesListSelected: makeMtpStoragesListSelected(state),
    fileTransferClipboard: makeFileTransferClipboard(state),
    fileTransferProgess: makeFileTransferProgess(state),
    filesDrag: makeFilesDrag(state),
    fileExplorerListingType: makeFileExplorerListingType(state),
    focussedFileExplorerDeviceType: makeFocussedFileExplorerDeviceType(state)
  };
};

export default withReducer(
  'Home',
  reducers
)(
  connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FileExplorer))
);
