'use strict';

import React, { Component } from 'react';
import { styles } from '../styles/ToolbarAreaPane';
import { imgsrc } from '../../../utils/imgsrc.js';
import MenuIcon from '@material-ui/icons/Menu';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { log } from '@Log';
import { withReducer } from '../../../store/reducers/withReducer';
import SidebarAreaPaneLists from './SidebarAreaPaneLists';
import reducers from '../reducers';
import {
  fetchDirList,
  processMtpOutput,
  processLocalOutput,
  changeMtpStorage,
  setMtpStorageOptions,
  getMtpStoragesListSelected,
  handleReloadDirList
} from '../actions';
import {
  makeDirectoryLists,
  makeIsLoading,
  makeMtpDevice,
  makeMtpStoragesList,
  makeSidebarFavouriteList,
  makeToolbarList
} from '../selectors';
import { makeCurrentBrowsePath } from '../selectors';
import { makeHideHiddenFiles } from '../../Settings/selectors';
import { delLocalFiles, delMtpFiles } from '../../../api/sys';
import { devicesDefaultPaths, deviceTypeConst } from '../../../constants';
import { Confirm as ConfirmDialog } from '../../../components/DialogBox';
import { Selection as SelectionDialog } from '../../../components/DialogBox';
import { pathUp } from '../../../utils/paths';
import { toggleSettings } from '../../Settings/actions';

class ToolbarAreaPane extends React.Component {
  constructor(props) {
    super(props);
    this.initialState = {
      toggleDrawer: false,
      toggleDeleteConfirmDialog: false,
      toggleMtpStorageSelectionDialog: false
    };
    this.state = {
      ...this.initialState
    };
  }

  handleToggleDrawer = status => () => {
    this.setState({
      toggleDrawer: status
    });
  };

  handleToggleDeleteConfirmDialog = status => {
    this.setState({
      toggleDeleteConfirmDialog: status
    });
  };

  handleToggleMtpStorageSelectionDialog = status => {
    this.setState({
      toggleMtpStorageSelectionDialog: status
    });
  };

  handleMtpStoragesListClick = ({ ...args }) => {
    const {
      handleSetMtpStorage,
      mtpStoragesList,
      deviceType,
      hideHiddenFiles
    } = this.props;

    const { selectedValue, triggerChange } = args;
    this.handleToggleMtpStorageSelectionDialog(false);

    if (!triggerChange) {
      return null;
    }

    handleSetMtpStorage(
      { selectedValue, mtpStoragesList },
      {
        filePath: devicesDefaultPaths.mtp,
        ignoreHidden: hideHiddenFiles[deviceType]
      },
      deviceType
    );
  };

  handleDeleteConfirmDialog = confirm => {
    const { deviceType } = this.props;

    this.handleToggleDeleteConfirmDialog(false);
    if (!confirm) {
      return null;
    }

    this._delFiles({ deviceType });
  };

  _handleToggleSettings = toggle => {
    const { handleToggleSettings } = this.props;
    handleToggleSettings(true);
  };

  activeToolbarList = ({ ...args }) => {
    const {
      toolbarList,
      directoryLists,
      currentBrowsePath,
      deviceType,
      mtpStoragesList,
      mtpDevice
    } = args;

    const _directoryLists = directoryLists[deviceType];
    const _currentBrowsePath = currentBrowsePath[deviceType];
    const _activeToolbarList = toolbarList[deviceType];
    const isMtp = deviceType === deviceTypeConst.mtp;

    Object.keys(_activeToolbarList).map(a => {
      const item = _activeToolbarList[a];
      switch (a) {
        case 'up':
          _activeToolbarList[a] = {
            ...item,
            enabled: _currentBrowsePath !== '/'
          };
          break;

        case 'refresh':
          _activeToolbarList[a] = {
            ...item
          };
          break;

        case 'delete':
          _activeToolbarList[a] = {
            ...item,
            enabled: _directoryLists.queue.selected.length > 0
          };
          break;

        case 'storage':
          _activeToolbarList[a] = {
            ...item,
            enabled:
              Object.keys(mtpStoragesList).length > 0 &&
              isMtp &&
              mtpDevice.isAvailable
          };
          break;

        case 'settings':
          _activeToolbarList[a] = {
            ...item
          };
          break;
        default:
          break;
      }
    });

    return _activeToolbarList;
  };

  handleToolbarAction = itemType => {
    const {
      currentBrowsePath,
      deviceType,
      hideHiddenFiles,
      handleReloadDirList,
      mtpStoragesList
    } = this.props;
    let filePath = '/';
    switch (itemType) {
      case 'up':
        filePath = pathUp(currentBrowsePath[deviceType]);
        this._fetchDirList({ filePath, deviceType });
        break;

      case 'refresh':
        filePath = currentBrowsePath[deviceType];
        handleReloadDirList(
          {
            filePath,
            ignoreHidden: hideHiddenFiles[deviceType]
          },
          deviceType,
          mtpStoragesList
        );
        break;

      case 'delete':
        this.handleToggleDeleteConfirmDialog(true);
        break;

      case 'storage':
        this.handleToggleMtpStorageSelectionDialog(true);
        break;

      case 'settings':
        this._handleToggleSettings(true);
        break;

      default:
        break;
    }
  };

  _fetchDirList = ({ filePath, deviceType, isSidemenu = false }) => {
    const { handleFetchDirList, hideHiddenFiles } = this.props;

    handleFetchDirList(
      {
        filePath,
        ignoreHidden: hideHiddenFiles[deviceType]
      },
      deviceType
    );
    if (isSidemenu) {
      this.handleToggleDrawer(false)();
    }
  };

  _delFiles = ({ deviceType }) => {
    const {
      directoryLists,
      handleDelFiles,
      hideHiddenFiles,
      currentBrowsePath
    } = this.props;
    handleDelFiles(
      {
        fileList: directoryLists[deviceType].queue.selected,
        deviceType
      },
      {
        filePath: currentBrowsePath[deviceType],
        ignoreHidden: hideHiddenFiles[deviceType]
      }
    );
  };

  render() {
    const {
      classes: styles,
      toolbarList,
      sidebarFavouriteList,
      deviceType,
      showMenu,
      currentBrowsePath,
      mtpStoragesList,
      directoryLists,
      mtpDevice
    } = this.props;

    const {
      toggleDeleteConfirmDialog,
      toggleMtpStorageSelectionDialog
    } = this.state;

    const _toolbarList = this.activeToolbarList({
      toolbarList,
      directoryLists,
      currentBrowsePath,
      deviceType,
      mtpStoragesList,
      mtpDevice
    });

    const { isLoaded: isLoadedDirectoryLists } = directoryLists[deviceType];

    return (
      <div className={styles.root}>
        <ConfirmDialog
          fullWidthDialog={true}
          maxWidthDialog="xs"
          bodyText="Are you sure you want to delete the items?"
          trigger={toggleDeleteConfirmDialog}
          onClickHandler={this.handleDeleteConfirmDialog}
        />
        <SelectionDialog
          titleText="Select Storage Option"
          list={mtpStoragesList}
          id="selectionDialog"
          open={
            deviceType === deviceTypeConst.mtp &&
            toggleMtpStorageSelectionDialog
          }
          onClose={this.handleMtpStoragesListClick}
        />
        <Drawer
          open={this.state.toggleDrawer}
          onClose={this.handleToggleDrawer(false)}
        >
          <div
            tabIndex={0}
            role="button"
            onClick={this.handleToggleDrawer(false)}
            onKeyDown={this.handleToggleDrawer(false)}
          />
          <SidebarAreaPaneLists
            onClickHandler={this._fetchDirList}
            sidebarFavouriteList={sidebarFavouriteList}
            deviceType={deviceType}
            currentBrowsePath={currentBrowsePath[deviceType]}
          />
        </Drawer>

        {!isLoadedDirectoryLists && (
          <div className={classNames(styles.lazyLoaderOverLay)} />
        )}

        <AppBar position="static" elevation={0} className={styles.appBar}>
          <Toolbar className={styles.toolbar} disableGutters={true}>
            {showMenu && (
              <IconButton
                color="inherit"
                aria-label="Open drawer"
                onClick={this.handleToggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
            )}

            <div className={styles.toolbarInnerWrapper}>
              {Object.keys(_toolbarList).map(a => {
                const item = _toolbarList[a];
                return (
                  <Tooltip key={a} title={item.label}>
                    <div className={styles.navBtns}>
                      <IconButton
                        aria-label={item.label}
                        disabled={!item.enabled}
                        onClick={events => this.handleToolbarAction(a)}
                        className={classNames({
                          [styles.disabledNavBtns]: !item.enabled,
                          [styles.invertedNavBtns]: item.invert
                        })}
                      >
                        <img
                          src={imgsrc(item.imgSrc, false)}
                          className={classNames(styles.navBtnImgs)}
                        />
                      </IconButton>
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}
const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      handleFetchDirList: ({ ...args }, deviceType) => (_, getState) => {
        dispatch(fetchDirList({ ...args }, deviceType, getState));
      },

      handleReloadDirList: ({ ...args }, deviceType, mtpStoragesList) => (
        _,
        getState
      ) => {
        dispatch(
          handleReloadDirList(
            { ...args },
            deviceType,
            mtpStoragesList,
            getState
          )
        );
      },

      handleDelFiles: (
        { fileList, deviceType },
        { ...fetchDirListArgs }
      ) => async (_, getState) => {
        try {
          switch (deviceType) {
            case deviceTypeConst.local:
              const {
                error: localError,
                stderr: localStderr,
                data: localData
              } = await delLocalFiles({
                fileList
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
              } = await delMtpFiles({
                fileList,
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

      handleSetMtpStorage: (
        { selectedValue, mtpStoragesList },
        { ...fetchDirArgs },
        deviceType
      ) => (_, getState) => {
        if (Object.keys(mtpStoragesList).length < 1) {
          return null;
        }

        let _mtpStoragesList = {};
        Object.keys(mtpStoragesList).map(a => {
          const item = mtpStoragesList[a];
          let _selectedValue = false;
          if (selectedValue === a) {
            _selectedValue = true;
          }

          _mtpStoragesList = {
            ...mtpStoragesList,
            ..._mtpStoragesList,
            [a]: {
              ...item,
              selected: _selectedValue
            }
          };
          return null;
        });

        dispatch(changeMtpStorage({ ..._mtpStoragesList }));
        dispatch(fetchDirList({ ...fetchDirArgs }, deviceType, getState));
      },
      handleToggleSettings: data => (_, getState) => {
        dispatch(toggleSettings(data));
      }
    },
    dispatch
  );

const mapStateToProps = (state, props) => {
  return {
    sidebarFavouriteList: makeSidebarFavouriteList(state),
    mtpDevice: makeMtpDevice(state),
    toolbarList: makeToolbarList(state),
    isLoading: makeIsLoading(state),
    currentBrowsePath: makeCurrentBrowsePath(state),
    hideHiddenFiles: makeHideHiddenFiles(state),
    directoryLists: makeDirectoryLists(state),
    mtpStoragesList: makeMtpStoragesList(state)
  };
};

export default withReducer('Home', reducers)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(ToolbarAreaPane))
);
