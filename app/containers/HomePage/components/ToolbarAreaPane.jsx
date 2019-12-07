'use strict';

/* eslint no-case-declarations: off */

import React, { PureComponent, Fragment } from 'react';
import { ipcRenderer } from 'electron';
import classNames from 'classnames';
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
  reloadDirList
} from '../actions';
import {
  makeDirectoryLists,
  makeMtpDevice,
  makeMtpStoragesList,
  makeSidebarFavouriteList,
  makeToolbarList,
  makeCurrentBrowsePath,
  makeFocussedFileExplorerDeviceType
} from '../selectors';
import { makeHideHiddenFiles } from '../../Settings/selectors';
import { delLocalFiles, delMtpFiles } from '../../../api/sys';
import { DEVICES_DEFAULT_PATH, DEVICES_TYPE_CONST } from '../../../constants';
import { pathUp } from '../../../utils/paths';
import { toggleSettings } from '../../Settings/actions';
import { toggleWindowSizeOnDoubleClick } from '../../../utils/titlebarDoubleClick';
import ToolbarBody from './ToolbarBody';
import { openExternalUrl } from '../../../utils/url';
import { APP_GITHUB_URL } from '../../../constants/meta';

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

  componentWillMount() {
    const { deviceType } = this.props;
    ipcRenderer.on(
      'fileExplorerToolbarActionCommunication',
      (event, { ...args }) => {
        const { type, deviceType: _focussedFileExplorerDeviceType } = args;
        if (deviceType !== _focussedFileExplorerDeviceType) {
          return null;
        }

        this._handleToolbarAction(type);
      }
    );
  }

  componentWillUnmount() {
    ipcRenderer.removeListener(
      'fileExplorerToolbarActionCommunication',
      () => {}
    );
  }

  _handleDoubleClickToolBar = event => {
    if (event.target !== event.currentTarget) {
      return null;
    }

    toggleWindowSizeOnDoubleClick();
  };

  _handleToggleDrawer = status => () => {
    this.setState({
      toggleDrawer: status
    });
  };

  _handleToggleDeleteConfirmDialog = status => {
    this.setState({
      toggleDeleteConfirmDialog: status
    });
  };

  _handleToggleMtpStorageSelectionDialog = status => {
    this.setState({
      toggleMtpStorageSelectionDialog: status
    });
  };

  _handleMtpStoragesListClick = ({ ...args }) => {
    const {
      actionCreateSetMtpStorage,
      mtpStoragesList,
      deviceType,
      hideHiddenFiles
    } = this.props;

    const { selectedValue, triggerChange } = args;
    this._handleToggleMtpStorageSelectionDialog(false);

    if (!triggerChange) {
      return null;
    }

    actionCreateSetMtpStorage(
      { selectedValue, mtpStoragesList },
      {
        filePath: DEVICES_DEFAULT_PATH.mtp,
        ignoreHidden: hideHiddenFiles[deviceType]
      },
      deviceType
    );
  };

  _handleDeleteConfirmDialog = confirm => {
    const { deviceType } = this.props;

    this._handleToggleDeleteConfirmDialog(false);
    if (!confirm) {
      return null;
    }

    this._handleDelFiles({ deviceType });
  };

  _handleToggleSettings = () => {
    const { actionCreateToggleSettings } = this.props;
    actionCreateToggleSettings(true);
  };

  _handleOpenGitHubRepo = () => {
    openExternalUrl(APP_GITHUB_URL);
  };

  _handleToolbarAction = itemType => {
    const {
      currentBrowsePath,
      deviceType,
      hideHiddenFiles,
      actionCreateReloadDirList,
      mtpStoragesList
    } = this.props;

    let filePath = '/';
    switch (itemType) {
      case 'up':
        filePath = pathUp(currentBrowsePath[deviceType]);
        this._handleFetchDirList({ filePath, deviceType });
        break;

      case 'refresh':
        filePath = currentBrowsePath[deviceType];
        actionCreateReloadDirList(
          {
            filePath,
            ignoreHidden: hideHiddenFiles[deviceType]
          },
          deviceType,
          mtpStoragesList
        );
        break;

      case 'delete':
        this._handleToggleDeleteConfirmDialog(true);
        break;

      case 'storage':
        this._handleToggleMtpStorageSelectionDialog(true);
        break;

      case 'settings':
        this._handleToggleSettings(true);
        break;

      case 'gitHub':
        this._handleOpenGitHubRepo();
        break;

      default:
        break;
    }
  };

  _handleFetchDirList = ({ filePath, deviceType, isSidemenu = false }) => {
    const { actionCreateFetchDirList, hideHiddenFiles } = this.props;

    actionCreateFetchDirList(
      {
        filePath,
        ignoreHidden: hideHiddenFiles[deviceType]
      },
      deviceType
    );
    if (isSidemenu) {
      this._handleToggleDrawer(false)();
    }
  };

  _handleDelFiles = ({ deviceType }) => {
    const {
      directoryLists,
      actionCreateDelFiles,
      hideHiddenFiles,
      currentBrowsePath
    } = this.props;
    actionCreateDelFiles(
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
      deviceType,
      directoryLists,
      focussedFileExplorerDeviceType,
      ...parentProps
    } = this.props;

    const {
      toggleDrawer,
      toggleDeleteConfirmDialog,
      toggleMtpStorageSelectionDialog
    } = this.state;

    const { isLoaded: isLoadedDirectoryLists } = directoryLists[deviceType];

    return (
      <Fragment>
        <ToolbarBody
          styles={styles}
          directoryLists={directoryLists}
          deviceType={deviceType}
          isLoadedDirectoryLists={isLoadedDirectoryLists}
          toggleDeleteConfirmDialog={toggleDeleteConfirmDialog}
          toggleMtpStorageSelectionDialog={toggleMtpStorageSelectionDialog}
          toggleDrawer={toggleDrawer}
          onDeleteConfirmDialog={this._handleDeleteConfirmDialog}
          onMtpStoragesListClick={this._handleMtpStoragesListClick}
          onToggleDrawer={this._handleToggleDrawer}
          onFetchDirList={this._handleFetchDirList}
          onDoubleClickToolBar={this._handleDoubleClickToolBar}
          onToolbarAction={this._handleToolbarAction}
          {...parentProps}
        />
        <div
          className={classNames({
            [styles.focussedFileExplorer]:
              focussedFileExplorerDeviceType.value === deviceType
          })}
        />
      </Fragment>
    );
  }
}
const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      actionCreateFetchDirList: ({ ...args }, deviceType) => (_, getState) => {
        dispatch(fetchDirList({ ...args }, deviceType, getState));
      },

      actionCreateReloadDirList: ({ ...args }, deviceType, mtpStoragesList) => (
        _,
        getState
      ) => {
        dispatch(
          reloadDirList({ ...args }, deviceType, mtpStoragesList, getState)
        );
      },

      actionCreateDelFiles: (
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

      actionCreateSetMtpStorage: (
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

      actionCreateToggleSettings: data => (_, getState) => {
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
    mtpStoragesList: makeMtpStoragesList(state),
    focussedFileExplorerDeviceType: makeFocussedFileExplorerDeviceType(state)
  };
};

export default withReducer(
  'Home',
  reducers
)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(ToolbarAreaPane))
);
