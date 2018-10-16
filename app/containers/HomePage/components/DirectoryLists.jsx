'use strict';

import React, { Component } from 'react';
import { styles } from '../styles/DirectoryLists';
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
import nanoid from 'nanoid';
import lodashSortBy from 'lodash/sortBy';
import DirectoryListsTableHead from './DirectoryListsTableHead';
import ContextMenu from './ContextMenu';
import { TextFieldEdit, ProgressBar } from '../../../components/DialogBox';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { log } from '@Log';
import { withReducer } from '../../../store/reducers/withReducer';
import reducers from '../reducers';
import {
  setSortingDirLists,
  setSelectedDirLists,
  fetchDirList,
  setContextMenuPos,
  clearContextMenuPos,
  processMtpOutput,
  processLocalOutput,
  setMtpStorageOptions,
  getMtpStoragesListSelected,
  setFileTransferClipboard
} from '../actions';
import {
  makeDirectoryLists,
  makeIsLoading,
  makeSelectedPath,
  makeMtpDevice,
  makeContextMenuPos,
  makeContextMenuList,
  makeMtpStoragesListSelected,
  makeFileTransferClipboard,
  makeFileTransferProgess
} from '../selectors';
import { makeHideHiddenFiles } from '../../Settings/selectors';
import { deviceTypeConst } from '../../../constants';
import { styles as contextMenuStyles } from '../styles/ContextMenu';
import {
  renameLocalFiles,
  checkFileExists,
  newLocalFolder,
  newMtpFolder
} from '../../../api/sys';
import { pathUp, sanitizePath } from '../../../utils/paths';
import { isFloat, isInt, niceBytes } from '../../../utils/funcs';
import { isNumber } from 'util';

class DirectoryLists extends React.Component {
  constructor(props) {
    super(props);
    this.initialState = {
      contextMenuFocussedRow: {
        rowData: {},
        tableData: {}
      },
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
        },
        paste: {
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
  }

  componentWillMount() {
    const {
      selectedPath,
      deviceType,
      handleFetchMtpStorageOptions,
      hideHiddenFiles
    } = this.props;

    if (deviceType === deviceTypeConst.mtp) {
      handleFetchMtpStorageOptions(
        {
          filePath: selectedPath[deviceType],
          ignoreHidden: hideHiddenFiles[deviceType]
        },
        deviceType
      );
    } else {
      this._fetchDirList({
        path: selectedPath[deviceType],
        deviceType: deviceType
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

  _handleContextMenuClick = (
    event,
    { ...rowData },
    { ...tableData },
    _target
  ) => {
    const {
      handleClearContextMenuClick,
      deviceType,
      contextMenuPos,
      mtpDevice
    } = this.props;

    if (
      deviceType === deviceTypeConst.mtp &&
      !mtpDevice.isAvailable &&
      this._checkOpenContextMenu(contextMenuPos)
    ) {
      this._setContextMenuFocussedRow({}, {});
      handleClearContextMenuClick(deviceType);

      return null;
    }

    if (event.type === 'contextmenu') {
      if (
        _target === 'tableWrapperTarget' &&
        event.target !== event.currentTarget
      ) {
        return null;
      }

      this._setContextMenuFocussedRow({ ...rowData }, { ...tableData });
      this.createContextMenu(event);
      return null;
    }

    if (this._checkOpenContextMenu(contextMenuPos)) {
      this._setContextMenuFocussedRow({}, {});
      handleClearContextMenuClick(deviceType);
    }
  };

  _setContextMenuFocussedRow = ({ ...rowData }, { ...tableData }) => {
    this.setState({
      contextMenuFocussedRow: {
        rowData: { ...rowData },
        tableData: { ...tableData }
      }
    });
  };

  _checkOpenContextMenu = contextMenuPos => {
    return (
      Object.keys(contextMenuPos).filter(a => {
        const item = contextMenuPos[a];

        return Object.keys(item).length > 0;
      }).length > 0
    );
  };

  createContextMenu = event => {
    const { handleContextMenuClick, deviceType } = this.props;
    const {
      root: rootStyles,
      heightDeviceLocal: deviceLocalStyles,
      heightDeviceMtp: deviceMtpStyles
    } = contextMenuStyles(null);

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const clickX = event.clientX;
    const clickY = event.clientY;
    const rootW = rootStyles.width;
    const rootH =
      deviceType === deviceTypeConst.local
        ? deviceLocalStyles.height
        : deviceMtpStyles.height;
    const right = screenW - clickX > rootW;
    const left = !right;
    const top = screenH - clickY > rootH;
    const bottom = !top;

    let pos = {
      left: 0,
      top: 0
    };

    if (right) {
      pos['left'] = clickX + 5;
    } else if (left) {
      pos['left'] = clickX - rootW - 5;
    }

    if (top) {
      pos['top'] = clickY + 5;
    } else if (bottom) {
      pos['top'] = clickY - rootH - 5;
    }

    handleContextMenuClick({ ...pos }, deviceType);
  };

  contextMenuActiveList = deviceType => {
    const { contextMenuList, fileTransferClipboard } = this.props;
    const { contextMenuFocussedRow } = this.state;
    const _contextMenuList = contextMenuList[deviceType];
    const contextMenuActiveList = {};
    const { queue } = this.props.directoryLists[deviceType];

    Object.keys(_contextMenuList).map(a => {
      const item = _contextMenuList[a];
      switch (a) {
        case 'rename':
          contextMenuActiveList[a] = {
            ...item,
            enabled: Object.keys(contextMenuFocussedRow.rowData).length > 0,
            data: contextMenuFocussedRow.rowData
          };
          break;

        case 'copy':
          contextMenuActiveList[a] = {
            ...item,
            enabled: queue.selected.length > 0
          };
          break;

        case 'paste':
          contextMenuActiveList[a] = {
            ...item,
            enabled:
              fileTransferClipboard.queue.length > 0 &&
              fileTransferClipboard.source !== deviceType
          };
          break;

        case 'newFolder':
          contextMenuActiveList[a] = {
            ...item,
            data: contextMenuFocussedRow.tableData
          };
          break;
        default:
          break;
      }
    });

    return contextMenuActiveList;
  };

  _handleContextMenuListActions = ({ ...args }) => {
    const {
      deviceType,
      directoryLists,
      handleClearContextMenuClick,
      handleCopy
    } = this.props;

    this._setContextMenuFocussedRow({}, {});
    handleClearContextMenuClick(deviceType);

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
          const selected = directoryLists[deviceType].queue.selected;
          handleCopy({ selected, deviceType });
          break;
        case 'paste':
          console.log(item);
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
      selectedPath,
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
        filePath: selectedPath[deviceType],
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

  handleNewFolderEditDialog = async ({ ...args }) => {
    const {
      deviceType,
      handleNewFolder,
      hideHiddenFiles,
      selectedPath,
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
        filePath: selectedPath[deviceType],
        ignoreHidden: hideHiddenFiles[deviceType]
      }
    );

    this.clearEditDialog(targetAction);
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
      contextMenuPos,
      selectedPath,
      directoryLists
    } = this.props;
    const { nodes, order, orderBy, queue } = directoryLists[deviceType];
    const { selected } = queue;
    const emptyRows = nodes.length < 1;
    const isMtp = deviceType === deviceTypeConst.mtp;
    const _contextMenuPos = contextMenuPos[deviceType];
    const contextMenuTrigger = Object.keys(_contextMenuPos).length > 0;
    const _eventTarget = 'tableWrapperTarget';
    const { toggleDialog } = this.state;
    const { rename, newFolder, paste } = toggleDialog;
    const tableData = {
      path: selectedPath[deviceType],
      directoryLists: directoryLists[deviceType]
    };

    return (
      <React.Fragment>
        <ContextMenu
          contextMenuList={this.contextMenuActiveList(deviceType) || {}}
          contextMenuPos={_contextMenuPos}
          trigger={contextMenuTrigger}
          deviceType={deviceType}
          onContextMenuListActions={this._handleContextMenuListActions}
        />
        <TextFieldEdit
          titleText="Rename?"
          bodyText={`Path: ${rename.data.path || ''}`}
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

        <TextFieldEdit
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

        <ProgressBar
          titleText="Copy files"
          bodyText={`Filnames here---`}
          trigger={paste.toggle}
          fullWidthDialog={true}
          maxWidthDialog="sm"
          onClickHandler={this.handleNewFolderEditDialog}
          errors={paste.errors}
        />

        <Paper className={styles.root} elevation={0} square={true}>
          <div
            className={styles.tableWrapper}
            onClick={this._handleContextMenuClick}
            onContextMenu={event =>
              this._handleContextMenuClick(
                event,
                {},
                { ...tableData },
                _eventTarget
              )
            }
          >
            <Table className={styles.table} aria-labelledby="tableTitle">
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
              <TableBody>
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
    if (isMtp && !mtpDevice.isAvailable) {
      return (
        <TableRow className={styles.emptyTableRowWrapper}>
          <TableCell colSpan={6} className={styles.tableCell}>
            <Paper style={{ height: `100%` }} elevation={0}>
              <Typography variant="subheading">
                Android device is not connected.
              </Typography>
              <ul>
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
                <li>Click Reload.</li>
                <li>
                  Reconnect the cable and redo all the steps if you keep seeing
                  this message.
                </li>
              </ul>
            </Paper>
          </TableCell>
        </TableRow>
      );
    }
    return (
      <TableRow className={styles.emptyTableRowWrapper}>
        <TableCell colSpan={6} className={styles.tableCell} />
      </TableRow>
    );
  };

  TableRowsRender = (n, isSelected) => {
    const {
      classes: styles,
      deviceType,
      hideColList,
      selectedPath,
      directoryLists
    } = this.props;
    const _eventTarget = 'tableCellTarget';

    const tableData = {
      path: selectedPath[deviceType],
      directoryLists: directoryLists[deviceType]
    };

    return (
      <TableRow
        hover={true}
        role="checkbox"
        aria-checked={isSelected}
        tabIndex={-1}
        key={nanoid(8)}
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
                <FolderIcon className={styles.tableCellIcon} fontSize="small" />
              </Tooltip>
            ) : (
              <Tooltip title="File">
                <InsertDriveFileIcon
                  className={styles.tableCellIcon}
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
    return (
      <React.Fragment>
        <TableFooter component="div" className={styles.tableFooter}>
          <p>Breadcrumb</p>
        </TableFooter>
      </React.Fragment>
    );
  };
}

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
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

      handleContextMenuClick: ({ ...args }, deviceType) => (_, getState) => {
        dispatch(setContextMenuPos({ ...args }, deviceType));
      },

      handleClearContextMenuClick: deviceType => (_, getState) => {
        dispatch(clearContextMenuPos(deviceType));
      },

      handleRenameFile: (
        { oldFilePath, newFilePath, deviceType },
        { ...fetchDirListArgs }
      ) => async (_, getState) => {
        try {
          switch (deviceType) {
            case deviceTypeConst.local:
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
            case deviceTypeConst.local:
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
            case deviceTypeConst.mtp:
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
          switch (deviceType) {
            case deviceTypeConst.local:
              dispatch(
                setFileTransferClipboard(
                  {
                    queue: selected || [],
                    source: deviceType
                  },
                  deviceType
                )
              );

              dispatch(setSelectedDirLists({ selected: [] }, deviceType));

              break;
            case deviceTypeConst.mtp:
              return;

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

      handlePaste: (
        { newFolderPath, deviceType },
        { ...fetchDirListArgs }
      ) => async (_, getState) => {
        return;

        try {
          switch (deviceType) {
            case deviceTypeConst.local:
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
            case deviceTypeConst.mtp:
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
      }
    },
    dispatch
  );

const mapStateToProps = (state, props) => {
  return {
    selectedPath: makeSelectedPath(state),
    mtpDevice: makeMtpDevice(state),
    directoryLists: makeDirectoryLists(state),
    isLoading: makeIsLoading(state),
    hideHiddenFiles: makeHideHiddenFiles(state),
    contextMenuPos: makeContextMenuPos(state),
    contextMenuList: makeContextMenuList(state),
    mtpStoragesListSelected: makeMtpStoragesListSelected(state),
    fileTransferClipboard: makeFileTransferClipboard(state),
    fileTransferProgess: makeFileTransferProgess(state)
  };
};

export default withReducer('Home', reducers)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(DirectoryLists))
);
