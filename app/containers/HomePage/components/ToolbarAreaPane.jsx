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
import { fetchDirList, processMtpOutput, processLocalOutput } from '../actions';
import {
  makeDirectoryLists,
  makeIsLoading,
  makeSidebarFavouriteList,
  makeToolbarList
} from '../selectors';
import { makeSelectedPath } from '../selectors';
import { makeToggleHiddenFiles } from '../../Settings/selectors';
import { delLocalFiles, delMtpFiles } from '../../../api/sys';
import { deviceTypeConst } from '../../../constants';
import { Confirm as ConfirmDialog } from '../../../components/DialogBox';
import { pathUp } from '../../../utils/paths';

class ToolbarAreaPane extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      toggleDrawer: false,
      toggleDeleteConfirmDialog: false
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

  handleDeleteConfirmDialog = confirm => {
    const { deviceType } = this.props;

    this.handleToggleDeleteConfirmDialog(false);
    if (!confirm) {
      return null;
    }

    this._delFiles({ deviceType });
  };

  handleToolbarAction = itemType => {
    const { selectedPath, deviceType } = this.props;
    let filePath = '/';
    switch (itemType) {
      case 'up':
        filePath = pathUp(selectedPath[deviceType]);
        this._fetchDirList({ filePath, deviceType });
        break;
      case 'refresh':
        filePath = selectedPath[deviceType];
        this._fetchDirList({ filePath, deviceType });
        break;
      case 'delete':
        this.handleToggleDeleteConfirmDialog(true);
        break;
      default:
        break;
    }
  };

  _fetchDirList = ({ filePath, deviceType, isSidemenu = false }) => {
    const { handleFetchDirList, toggleHiddenFiles } = this.props;

    handleFetchDirList(
      {
        filePath,
        ignoreHidden: toggleHiddenFiles[deviceType]
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
      toggleHiddenFiles,
      selectedPath
    } = this.props;
    handleDelFiles(
      {
        fileList: directoryLists[deviceType].queue.selected,
        deviceType
      },
      {
        filePath: selectedPath[deviceType],
        ignoreHidden: toggleHiddenFiles[deviceType]
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
      selectedPath
    } = this.props;

    const { toggleDeleteConfirmDialog } = this.state;
    return (
      <div className={styles.root}>
        <ConfirmDialog
          bodyText="Are you sure you want to delete the items?"
          trigger={toggleDeleteConfirmDialog}
          onClickHandler={this.handleDeleteConfirmDialog}
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
            selectedPath={selectedPath[deviceType]}
          />
        </Drawer>
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
              {Object.keys(toolbarList[deviceType]).map(a => {
                const item = toolbarList[deviceType][a];
                return (
                  <Tooltip key={a} title={item.label}>
                    <div>
                      <IconButton
                        aria-label={item.label}
                        disabled={!item.enabled}
                        onClick={events => this.handleToolbarAction(a)}
                        className={classNames({
                          [styles.invertedNavBtns]: item.invert
                        })}
                      >
                        <img
                          src={imgsrc(item.imgSrc, false)}
                          className={classNames(styles.navBtns)}
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
        dispatch(fetchDirList({ ...args }, deviceType));
      },
      handleDelFiles: (
        { fileList, deviceType },
        { ...fetchDirListArgs }
      ) => async (_, getState) => {
        try {
          switch (deviceType) {
            case deviceTypeConst.mtp:
              const {
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
              );
              break;
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
    sidebarFavouriteList: makeSidebarFavouriteList(state),
    toolbarList: makeToolbarList(state),
    isLoading: makeIsLoading(state),
    selectedPath: makeSelectedPath(state),
    toggleHiddenFiles: makeToggleHiddenFiles(state),
    directoryLists: makeDirectoryLists(state)
  };
};

export default withReducer('Home', reducers)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(ToolbarAreaPane))
);
