'use strict';

import React, { Component } from 'react';
import { LazyLoaderOverLay, styles } from '../styles/ToolbarAreaPane';
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
import { DEVICES_DEFAULT_PATH, DEVICES_TYPE_CONST } from '../../../constants';
import { Confirm as ConfirmDialog } from '../../../components/DialogBox';
import { Selection as SelectionDialog } from '../../../components/DialogBox';
import { pathUp } from '../../../utils/paths';
import { toggleSettings } from '../../Settings/actions';
import { toggleWindowSizeOnDoubleClick } from '../../../utils/titlebarDoubleClick';

export default class ToolbarAreaPane extends Component {
  constructor(props) {
    super(props);
  }

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
          showDiskAvatars={true}
          open={
            deviceType === DEVICES_TYPE_CONST.mtp &&
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
        {!isLoadedDirectoryLists && <LazyLoaderOverLay />}

        <AppBar position="static" elevation={0} className={styles.appBar}>
          <Toolbar
            className={styles.toolbar}
            disableGutters={true}
            onDoubleClick={event => {
              this.handleDoubleClickToolBar(event);
            }}
          >
            {showMenu && (
              <IconButton
                color="inherit"
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
                          alt={item.label}
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
