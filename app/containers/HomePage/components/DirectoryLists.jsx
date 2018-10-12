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
import DirectoryListsTableHead from './DirectoryListsTableHead';
import ContextMenu from './ContextMenu';
import { TextFieldEdit } from '../../../components/DialogBox';
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
  processLocalOutput
} from '../actions';
import {
  makeDirectoryLists,
  makeIsLoading,
  makeSelectedPath,
  makeMtpDevice,
  makeContextMenuPos,
  makeContextMenuList
} from '../selectors';
import { makeToggleHiddenFiles } from '../../Settings/selectors';
import { deviceTypeConst } from '../../../constants';
import { styles as contextMenuStyles } from '../styles/ContextMenu';
import { renameLocalFiles } from '../../../api/sys';
import { pathUp, sanitizePath } from '../../../utils/paths';

class DirectoryLists extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      contextMenuFocussedRow: {},
      renameDialog: {
        errors: {
          toggle: false,
          message: null
        },
        toggle: false,
        data: {}
      }
    };
  }

  componentWillMount() {
    const { selectedPath, deviceType } = this.props;

    this._fetchDirList({
      path: selectedPath[deviceType],
      deviceType: deviceType
    });
  }

  handleToggleRenameEditDialog = ({ ...args }) => {
    const { renameDialog } = this.state;
    this.setState({
      renameDialog: {
        ...renameDialog,
        ...args
      }
    });
  };

  handleErrorsRenameEditDialog = ({ ...args }) => {
    const { renameDialog } = this.state;
    this.setState({
      renameDialog: {
        ...renameDialog,
        errors: { ...args }
      }
    });
  };

  clearRenameEditDialog = () => {
    this.setState({
      renameDialog: {
        errors: {
          toggle: false,
          message: null
        },
        toggle: false,
        data: {}
      }
    });
  };

  handleRenameEditDialog = ({ ...args }) => {
    const {
      deviceType,
      handleRenameFile,
      toggleHiddenFiles,
      selectedPath
    } = this.props;
    const { data } = this.state.renameDialog;
    const { confirm, textFieldValue } = args;

    if (!confirm || textFieldValue === null) {
      this.clearRenameEditDialog();
      return null;
    }

    if (textFieldValue.trim() === '' || /[/\\?%*:|"<>]/g.test(textFieldValue)) {
      this.handleErrorsRenameEditDialog({
        toggle: true,
        message: `Error: Illegal characters.`
      });
      return null;
    }

    //same file name; no change
    const _pathUp = pathUp(data.path);
    const newFilePath = sanitizePath(`${_pathUp}/${textFieldValue}`);
    const oldFilePath = data.path;

    if (newFilePath === data.path) {
      this.clearRenameEditDialog();
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
        ignoreHidden: toggleHiddenFiles[deviceType]
      }
    );

    this.clearRenameEditDialog();
  };

  _handleContextMenuListActions = ({ ...args }) => {
    const { deviceType, handleClearContextMenuClick } = this.props;

    this._setContextMenuFocussedRow({});
    handleClearContextMenuClick(deviceType);

    Object.keys(args).map(a => {
      const item = args[a];
      switch (a) {
        case 'rename':
          this.handleToggleRenameEditDialog({
            toggle: true,
            data: {
              ...item.data
            }
          });
          break;
        case 'copy':
          console.log(item);
          break;
        case 'newFolder':
          console.log(item);
          break;
        default:
          break;
      }
    });
  };

  _handleContextMenuClick = (event, { ...args }, _target) => {
    const {
      handleClearContextMenuClick,
      deviceType,
      contextMenuPos
    } = this.props;
    if (event.type === 'contextmenu') {
      if (
        _target === 'tableWrapperTarget' &&
        event.target !== event.currentTarget
      ) {
        return null;
      }
      this._setContextMenuFocussedRow({ ...args });
      this.createContextMenu(event);
      return null;
    }

    if (this._checkOpenContextMenu(contextMenuPos)) {
      this._setContextMenuFocussedRow({});
      handleClearContextMenuClick(deviceType);
    }
  };

  _setContextMenuFocussedRow = ({ ...args }) => {
    this.setState({
      contextMenuFocussedRow: { ...args }
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
    const { root } = contextMenuStyles(null);

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const clickX = event.clientX;
    const clickY = event.clientY;
    const rootW = root.width;
    const rootH = root.height;

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
    const { contextMenuList } = this.props;
    const { contextMenuFocussedRow } = this.state;
    const _contextMenuList = contextMenuList[deviceType];
    const contextMenuActiveList = {};
    const { queue } = this.props.directoryLists[deviceType];

    Object.keys(_contextMenuList).map(a => {
      const item = _contextMenuList[a];
      switch (a) {
        default:
          break;
        case 'rename':
          contextMenuActiveList[a] = {
            ...item,
            enabled: Object.keys(contextMenuFocussedRow).length > 0,
            data: contextMenuFocussedRow
          };
          break;

        case 'copy':
          contextMenuActiveList[a] = {
            ...item,
            enabled: queue.selected.length > 0
          };
          break;

        case 'newFolder':
          contextMenuActiveList[a] = {
            ...item
          };
          break;
      }
    });

    return contextMenuActiveList;
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

  _fetchDirList({ path, deviceType }) {
    const { handleFetchDirList, toggleHiddenFiles } = this.props;

    handleFetchDirList(
      {
        filePath: path,
        ignoreHidden: toggleHiddenFiles[deviceType]
      },
      deviceType
    );
  }

  render() {
    const {
      classes: styles,
      deviceType,
      hideColList,
      contextMenuPos
    } = this.props;
    const { nodes, order, orderBy, queue } = this.props.directoryLists[
      deviceType
    ];
    const { selected } = queue;
    const emptyRows = nodes.length < 1;
    const isMtp = deviceType === deviceTypeConst.mtp;
    const _contextMenuPos = contextMenuPos[deviceType];
    const contextMenuTrigger = Object.keys(_contextMenuPos).length > 0;
    const _eventTarget = 'tableWrapperTarget';
    const { renameDialog } = this.state;
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
          bodyText={`Path: ${renameDialog.data.path}`}
          trigger={renameDialog.toggle}
          defaultValue={renameDialog.data.name}
          label={
            renameDialog.data.isFolder ? `New folder name` : `New file name`
          }
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
          errors={renameDialog.errors}
        />
        <Paper className={styles.root} elevation={0} square={true}>
          <div
            className={styles.tableWrapper}
            onClick={this._handleContextMenuClick}
            onContextMenu={event =>
              this._handleContextMenuClick(event, {}, _eventTarget)
            }
          >
            <Table className={styles.table} aria-labelledby="tableTitle">
              <DirectoryListsTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={this.props.handleSelectAllClick.bind(
                  this,
                  deviceType
                )}
                onRequestSort={this.props.handleRequestSort.bind(
                  this,
                  deviceType
                )}
                rowCount={nodes ? nodes.length : 0}
                hideColList={hideColList}
              />
              <TableBody>
                {emptyRows
                  ? this.EmptyRowRender(isMtp)
                  : this.stableSort(nodes, this.getSorting(order, orderBy)).map(
                      n => {
                        return this.TableRowsRender(n, this.isSelected(n.path));
                      }
                    )}
              </TableBody>
            </Table>
          </div>
          {this.TableFooter()}
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
            <Paper elevation={0}>
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
    const { classes: styles, deviceType, hideColList } = this.props;
    const _eventTarget = 'tableCellTarget';

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
            this._handleContextMenuClick(event, { ...n }, _eventTarget)
          }
        >
          <Checkbox
            checked={isSelected}
            onClick={event =>
              this.props.handleTableClick(n.path, deviceType, event)
            }
          />
        </TableCell>
        {hideColList.indexOf('name') < 0 && (
          <TableCell
            padding="default"
            className={`${styles.tableCell} nameCell`}
            onContextMenu={event =>
              this._handleContextMenuClick(event, { ...n }, _eventTarget)
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
              this._handleContextMenuClick(event, { ...n }, _eventTarget)
            }
          >
            {n.size} KB
          </TableCell>
        )}
        {hideColList.indexOf('dateAdded') < 0 && (
          <TableCell
            padding="none"
            className={`${styles.tableCell} dateAddedCell`}
            onContextMenu={event =>
              this._handleContextMenuClick(event, { ...n }, _eventTarget)
            }
          >
            {n.dateAdded}
          </TableCell>
        )}
      </TableRow>
    );
  };

  TableFooter = () => {
    return (
      <React.Fragment>
        <TableFooter component="div" className={styles.tableFooter}>
          <p>Breadcrumb</p>
        </TableFooter>
      </React.Fragment>
    );
  };

  isSelected = path => {
    const { directoryLists, deviceType } = this.props;
    const _directoryLists = directoryLists[deviceType].queue.selected;

    return _directoryLists.indexOf(path) !== -1;
  };

  stableSort = (array, cmp) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = cmp(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map(el => el[0]);
  };

  desc = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  getSorting = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => this.desc(a, b, orderBy)
      : (a, b) => -this.desc(a, b, orderBy);
  };
}

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      handleRequestSort: (deviceType, property, event) => (_, getState) => {
        const orderBy = property;
        const {
          orderBy: _orderBy,
          order: _order
        } = getState().Home.directoryLists[deviceType];
        let order = 'desc';

        if (_orderBy === property && _order === 'desc') {
          order = 'asc';
        }

        dispatch(setSortingDirLists({ order, orderBy }, deviceType));
      },

      handleSelectAllClick: (deviceType, event) => (_, getState) => {
        if (event.target.checked) {
          dispatch(
            setSelectedDirLists(
              {
                selected: getState().Home.directoryLists[deviceType].nodes.map(
                  n => n.path
                )
              },
              deviceType
            )
          );
          return;
        }

        dispatch(setSelectedDirLists({ selected: [] }, deviceType));
      },

      handleTableClick: (path, deviceType, event) => (_, getState) => {
        const { selected } = getState().Home.directoryLists[deviceType].queue;
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
        dispatch(setSelectedDirLists({ selected: newSelected }, deviceType));
      },

      handleFetchDirList: ({ ...args }, deviceType) => (_, getState) => {
        dispatch(fetchDirList({ ...args }, deviceType));
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
            case deviceTypeConst.mtp:
              /* const {
              error: mtpError,
              stderr: mtpStderr,
              data: mtpData
            } = await delMtpFiles({
              fileList
            });

            dispatch(
              processMtpOutput({
                deviceType,
                error: mtpError,
                stderr: mtpStderr,
                data: mtpData,
                callback: a => {
                  dispatch(fetchDirList({ ...fetchDirListArgs }, deviceType));
                }
              })
            );*/
              break;
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
                    dispatch(fetchDirList({ ...fetchDirListArgs }, deviceType));
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
    toggleHiddenFiles: makeToggleHiddenFiles(state),
    contextMenuPos: makeContextMenuPos(state),
    contextMenuList: makeContextMenuList(state)
  };
};

export default withReducer('Home', reducers)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(DirectoryLists))
);
