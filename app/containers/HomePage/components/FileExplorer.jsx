'use strict';

import React, { Component } from 'react';
import { styles } from '../styles/FileExplorer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import FolderIcon from '@material-ui/icons/Folder';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import lodashSortBy from 'lodash/sortBy';
import DirectoryListsTableHead from './DirectoryListsTableHead';
import Breadcrumb from '../../../components/Breadcrumb';
import {
  TextFieldEdit as TextFieldEditDialog,
  ProgressBar as ProgressBarDialog,
  Confirm as ConfirmDialog
} from '../../../components/DialogBox';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { log } from '@Log';
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
import { makeHideHiddenFiles } from '../../Settings/selectors';
import { DEVICES_TYPE_CONST } from '../../../constants';
import {
  renameLocalFiles,
  checkFileExists,
  newLocalFolder,
  newMtpFolder,
  pasteFiles,
  renameMtpFiles
} from '../../../api/sys';
import { baseName, pathUp, sanitizePath } from '../../../utils/paths';
import { isFloat, isInt, niceBytes, quickHash } from '../../../utils/funcs';
import { isNumber } from 'util';
import { throwAlert } from '../../Alerts/actions';
import { remote } from 'electron';
import { imgsrc } from '../../../utils/imgsrc';
const { Menu } = remote;

let filesDragGhostImg = new Image(0, 0);
filesDragGhostImg.src = imgsrc('copy.svg');

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
        deviceType: deviceType
      });
    }
  }

  componentDidMount() {}

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
    const { deviceType, mtpDevice } = this.props;

    if (deviceType === DEVICES_TYPE_CONST.mtp && !mtpDevice.isAvailable) {
      return null;
    }

    if (event.type === 'contextmenu') {
      if (
        _target === 'tableWrapperTarget' &&
        event.target !== event.currentTarget
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
    let contextMenuActiveList = [];

    Object.keys(_contextMenuList).map(a => {
      const item = _contextMenuList[a];
      switch (a) {
        case 'rename':
          contextMenuActiveList.push({
            label: item.label,
            enabled: Object.keys(rowData).length > 0,
            data: rowData,
            click: e => {
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
            click: e => {
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
            click: e => {
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
            click: e => {
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
          selected = directoryLists[item.data.sourceDeviceType].queue.selected;
          handleCopy({ selected, deviceType: item.data.sourceDeviceType });
          this._handlePaste();
          break;
        case 'cancel':
          break;
        default:
          break;
      }
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

    //same file name; no change
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
        oldFilePath: oldFilePath,
        newFilePath: newFilePath,
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
      sourceDeviceType: sourceDeviceType,
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
      return null;
    }

    if (filesDrag.lock) {
      return null;
    }
    this.setFilesDrag({
      sourceDeviceType: filesDrag.sourceDeviceType,
      destinationDeviceType: destinationDeviceType,
      enter: true,
      lock: true
    });
  };

  handleFilesDragEnd = e => {
    this.clearFilesDrag();
  };

  handleTableDrop = e => {
    const { filesDrag } = this.props;
    const { sourceDeviceType, destinationDeviceType } = filesDrag;

    if (
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
        click: e => {
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
        click: e => {
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
        newFolderPath: newFolderPath,
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

  _onBreadcrumbPathClickHandler = ({ ...args }) => {
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

  _handleRequestSort = (deviceType, property, event) => {
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
    const selected = directoryLists[deviceType].nodes.map(n => n.path) || [];
    const isChecked = event.target.checked;

    handleSelectAllClick({ selected }, isChecked, deviceType);
  };

  _handleTableClick = (path, deviceType, event) => {
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

  handleTableDoubleClick({ path, deviceType, isFolder }) {
    if (!isFolder) {
      return null;
    }

    this._fetchDirList({
      path: path,
      deviceType: deviceType
    });
  }

  isSelected = path => {
    const { directoryLists, deviceType } = this.props;
    const _directoryLists = directoryLists[deviceType].queue.selected;

    return _directoryLists.indexOf(path) !== -1;
  };

  _lodashSortConstraints = ({ value, orderBy }) => {
    if (orderBy === 'size' && value['isFolder']) {
      return 0;
    }

    const item = value[orderBy];
    let _primer = null;

    if (isNumber(item)) {
      if (isInt(item)) {
        _primer = parseInt(item);
      } else if (isFloat) {
        _primer = parseFloat(item);
      }
    }

    if (_primer === null) {
      _primer = item.toLowerCase();
    }

    return _primer;
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

  render() {
    const {
      classes: styles,
      deviceType,
      hideColList,
      currentBrowsePath,
      directoryLists,
      fileTransferProgess
    } = this.props;
    const { nodes, order, orderBy, queue, isLoaded } = directoryLists[
      deviceType
    ];
    const { selected } = queue;
    const emptyRows = nodes.length < 1;
    const isMtp = deviceType === DEVICES_TYPE_CONST.mtp;
    const { toggleDialog, togglePasteConfirmDialog } = this.state;
    const { rename, newFolder } = toggleDialog;
    const tableData = {
      path: currentBrowsePath[deviceType],
      directoryLists: directoryLists[deviceType]
    };

    const _eventTarget = 'tableWrapperTarget';
    const togglePasteDialog =
      deviceType === DEVICES_TYPE_CONST.mtp && fileTransferProgess.toggle;
    const renameSecondaryText =
      deviceType === DEVICES_TYPE_CONST.mtp
        ? `Every MTP device does not support the Rename feature.`
        : ``;

    return (
      <React.Fragment>
        <TextFieldEditDialog
          titleText="Rename?"
          bodyText={`Path: ${rename.data.path || ''}`}
          secondaryText={`${renameSecondaryText}`}
          trigger={rename.toggle}
          defaultValue={rename.data.name || ''}
          label={rename.data.isFolder ? `New folder name` : `New file name`}
          id="renameDialog"
          required={true}
          multiline={false}
          fullWidthDialog={true}
          maxWidthDialog="sm"
          fullWidthTextField={true}
          autoFocus={true}
          onClickHandler={this.handleRenameEditDialog}
          btnPositiveText="Rename"
          btnNegativeText="Cancel"
          errors={rename.errors}
        />

        <TextFieldEditDialog
          titleText="New folder"
          bodyText={`Path: ${newFolder.data.path || ''}`}
          trigger={newFolder.toggle}
          defaultValue={''}
          label="New folder name"
          id="newFolderDialog"
          required={true}
          multiline={false}
          fullWidthDialog={true}
          maxWidthDialog="sm"
          fullWidthTextField={true}
          autoFocus={true}
          onClickHandler={this.handleNewFolderEditDialog}
          btnPositiveText="Create"
          btnNegativeText="Cancel"
          errors={newFolder.errors}
        />

        <ProgressBarDialog
          titleText="Transferring..."
          bodyText1={`${
            fileTransferProgess.bodyText1 ? fileTransferProgess.bodyText1 : ''
          }`}
          bodyText2={`${
            fileTransferProgess.bodyText2 ? fileTransferProgess.bodyText2 : ''
          }`}
          trigger={togglePasteDialog}
          fullWidthDialog={true}
          maxWidthDialog="sm"
          onClickHandler={this.handleNewFolderEditDialog}
          variant="determinate"
          helpText={`In case the progress bar freezes while transferring the files, restart the app and reconnect the device. This is a well known Android MTP bug.`}
          progressValue={fileTransferProgess.percentage}
        />

        <ConfirmDialog
          fullWidthDialog={true}
          maxWidthDialog="xs"
          bodyText="Replace and merge the existing items?"
          trigger={togglePasteConfirmDialog}
          onClickHandler={this.handlePasteConfirmDialog}
        />

        <Paper className={styles.root} elevation={0} square={true}>
          <div
            className={classNames(styles.tableWrapper, {
              [`onHoverDropZone`]: this.handleOnHoverDropZoneActivate(
                deviceType
              )
            })}
            onContextMenu={event =>
              this._handleContextMenuClick(
                event,
                {},
                { ...tableData },
                _eventTarget
              )
            }
            onDragOver={e => {
              this.handleFilesDragOver(e, {
                destinationDeviceType: deviceType
              });
            }}
            onDragEnd={e => {
              this.handleFilesDragEnd(e);
            }}
            onDrop={e => {
              this.handleTableDrop(e);
            }}
          >
            <Table className={styles.table}>
              <DirectoryListsTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={this._handleSelectAllClick.bind(
                  this,
                  deviceType
                )}
                onRequestSort={this._handleRequestSort.bind(this, deviceType)}
                rowCount={nodes ? nodes.length : 0}
                hideColList={hideColList}
              />
              <TableBody
                draggable={this.handleIsDraggable(deviceType)}
                onDragStart={e => {
                  this.handleFilesDragStart(e, {
                    sourceDeviceType: deviceType
                  });
                }}
              >
                {emptyRows
                  ? this.EmptyRowRender(isMtp)
                  : this.tableSort({
                      nodes,
                      order,
                      orderBy
                    }).map(n => {
                      return this.TableRowsRender(n, this.isSelected(n.path));
                    })}
              </TableBody>
            </Table>
          </div>
          {this.TableFooterRender()}
        </Paper>
      </React.Fragment>
    );
  }

  EmptyRowRender = isMtp => {
    const { classes: styles, mtpDevice } = this.props;
    const _eventTarget = 'emptyRowTarget';
    if (isMtp && !mtpDevice.isAvailable) {
      return (
        <TableRow className={styles.emptyTableRowWrapper}>
          <TableCell colSpan={6} className={styles.tableCell}>
            <Paper style={{ height: `100%` }} elevation={0}>
              <Typography variant="subheading" className={styles.noMtp}>
                Android device is either busy or not connected.
              </Typography>
              <ul className={styles.instructions}>
                <li>Close other MTP applications.</li>
                <li>
                  Use the USB cable that came with your Android device and
                  connect it to your Mac.
                </li>
                <li>Unlock your Android device.</li>
                <li>With a USB cable, connect your device to your computer.</li>
                <li>
                  On your device, tap the "Charging this device via USB"
                  notification.
                </li>
                <li>Under "Use USB for" select File Transfer.</li>
                <li>Click Refresh Button above.</li>
                <li>
                  Reconnect the cable and repeat all the above steps if you keep
                  seeing this message.
                </li>
              </ul>
            </Paper>
          </TableCell>
        </TableRow>
      );
    }
    return (
      <TableRow className={styles.emptyTableRowWrapper}>
        <TableCell
          colSpan={6}
          className={styles.tableCell}
          onContextMenu={event =>
            this._handleContextMenuClick(event, {}, {}, _eventTarget)
          }
        />
      </TableRow>
    );
  };

  TableRowsRender = (n, isSelected) => {
    const {
      classes: styles,
      deviceType,
      hideColList,
      currentBrowsePath,
      directoryLists
    } = this.props;
    const _eventTarget = 'tableCellTarget';

    const tableData = {
      path: currentBrowsePath[deviceType],
      directoryLists: directoryLists[deviceType]
    };
    return (
      <TableRow
        hover={true}
        role="checkbox"
        aria-checked={isSelected}
        tabIndex={-1}
        key={quickHash(n.path)}
        selected={isSelected}
        className={classNames({
          [styles.tableRowSelected]: isSelected
        })}
        onDoubleClick={event =>
          this.handleTableDoubleClick({
            path: n.path,
            deviceType: deviceType,
            isFolder: n.isFolder,
            event
          })
        }
      >
        <TableCell
          padding="none"
          className={`${styles.tableCell} checkboxCell`}
          onContextMenu={event =>
            this._handleContextMenuClick(
              event,
              { ...n },
              { ...tableData },
              _eventTarget
            )
          }
        >
          <Checkbox
            checked={isSelected}
            onClick={event => this._handleTableClick(n.path, deviceType, event)}
          />
        </TableCell>
        {hideColList.indexOf('name') < 0 && (
          <TableCell
            padding="default"
            className={`${styles.tableCell} nameCell`}
            onContextMenu={event =>
              this._handleContextMenuClick(
                event,
                { ...n },
                { ...tableData },
                _eventTarget
              )
            }
          >
            {n.isFolder ? (
              <Tooltip title="Folder">
                <FolderIcon
                  className={classNames(styles.tableCellIcon, `isFolder`)}
                  fontSize="small"
                />
              </Tooltip>
            ) : (
              <Tooltip title="File">
                <InsertDriveFileIcon
                  className={classNames(styles.tableCellIcon, `isFile`)}
                  fontSize="small"
                />
              </Tooltip>
            )}
            &nbsp;&nbsp;
            {n.name}
          </TableCell>
        )}
        {hideColList.indexOf('size') < 0 && (
          <TableCell
            padding="none"
            className={`${styles.tableCell} sizeCell`}
            onContextMenu={event =>
              this._handleContextMenuClick(
                event,
                { ...n },
                { ...tableData },
                _eventTarget
              )
            }
          >
            {n.isFolder ? `--` : `${niceBytes(n.size)}`}
          </TableCell>
        )}
        {hideColList.indexOf('dateAdded') < 0 && (
          <TableCell
            padding="none"
            className={`${styles.tableCell} dateAddedCell`}
            onContextMenu={event =>
              this._handleContextMenuClick(
                event,
                { ...n },
                { ...tableData },
                _eventTarget
              )
            }
          >
            {n.dateAdded}
          </TableCell>
        )}
      </TableRow>
    );
  };

  TableFooterRender = () => {
    const { currentBrowsePath, deviceType } = this.props;
    return (
      <React.Fragment>
        <TableFooter component="div" className={styles.tableFooter}>
          <Breadcrumb
            onBreadcrumbPathClickHandler={this._onBreadcrumbPathClickHandler}
            currentBrowsePath={currentBrowsePath[deviceType]}
          />
        </TableFooter>
      </React.Fragment>
    );
  };
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
                  callback: a => {
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
                oldFilePath: oldFilePath,
                newFilePath: newFilePath,
                mtpStoragesListSelected
              });

              dispatch(
                processMtpOutput({
                  deviceType,
                  error: mtpError,
                  stderr: mtpStderr,
                  data: mtpData,
                  callback: a => {
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
                  callback: a => {
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
                  callback: a => {
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
                getState
              );
              break;
            case DEVICES_TYPE_CONST.mtp:
              pasteFiles(
                { ...pasteArgs },
                { ...fetchDirListArgs },
                'localtoMtp',
                deviceType,
                dispatch,
                getState
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

      handleClearFilesDrag: ({ ...args }) => (_, getState) => {
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
    filesDrag: makeFilesDrag(state)
  };
};

export default withReducer('Home', reducers)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(FileExplorer))
);
