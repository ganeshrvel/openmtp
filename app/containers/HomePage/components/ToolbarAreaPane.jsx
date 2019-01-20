'use strict';

/* eslint no-case-declarations: off */

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { log } from '@Log';
import { styles } from '../styles/ToolbarAreaPane';
import { withReducer } from '../../../store/reducers/withReducer';
import reducers from '../reducers';
import {
  fetchDirList,
  processMtpOutput,
  processLocalOutput,
  changeMtpStorage,
  getMtpStoragesListSelected,
  handleReloadDirList
} from '../actions';
import {
  makeDirectoryLists,
  makeMtpDevice,
  makeMtpStoragesList,
  makeSidebarFavouriteList,
  makeToolbarList,
  makeCurrentBrowsePath
} from '../selectors';
import { makeHideHiddenFiles } from '../../Settings/selectors';
import { delLocalFiles, delMtpFiles } from '../../../api/sys';
import { DEVICES_DEFAULT_PATH, DEVICES_TYPE_CONST } from '../../../constants';
import { pathUp } from '../../../utils/paths';
import { toggleSettings } from '../../Settings/actions';
import { toggleWindowSizeOnDoubleClick } from '../../../utils/titlebarDoubleClick';
import ToolbarBody from './ToolbarBody';

class ToolbarAreaPane extends PureComponent {
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

  handleDoubleClickToolBar = event => {
    if (event.target !== event.currentTarget) {
      return null;
    }

    toggleWindowSizeOnDoubleClick();
  };

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
        filePath: DEVICES_DEFAULT_PATH.mtp,
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

  _handleToggleSettings = () => {
    const { handleToggleSettings } = this.props;
    handleToggleSettings(true);
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
      toggleDrawer,
      toggleDeleteConfirmDialog,
      toggleMtpStorageSelectionDialog
    } = this.state;

    const { isLoaded: isLoadedDirectoryLists } = directoryLists[deviceType];

    return (
      <ToolbarBody
        directoryLists={directoryLists}
        mtpDevice={mtpDevice}
        styles={styles}
        sidebarFavouriteList={sidebarFavouriteList}
        deviceType={deviceType}
        showMenu={showMenu}
        currentBrowsePath={currentBrowsePath}
        mtpStoragesList={mtpStoragesList}
        toggleDeleteConfirmDialog={toggleDeleteConfirmDialog}
        toggleMtpStorageSelectionDialog={toggleMtpStorageSelectionDialog}
        toolbarList={toolbarList}
        isLoadedDirectoryLists={isLoadedDirectoryLists}
        toggleDrawer={toggleDrawer}
        handleDeleteConfirmDialog={this.handleDeleteConfirmDialog}
        handleMtpStoragesListClick={this.handleMtpStoragesListClick}
        handleToggleDrawer={this.handleToggleDrawer}
        fetchDirList={this._fetchDirList}
        handleDoubleClickToolBar={this.handleDoubleClickToolBar}
        handleToolbarAction={this.handleToolbarAction}
      />
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
            case DEVICES_TYPE_CONST.local:
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
