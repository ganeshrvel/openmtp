'use strict';

import React, { PureComponent } from 'react';
import MenuIcon from '@material-ui/icons/Menu';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import SidebarAreaPaneLists from './SidebarAreaPaneLists';
import { LazyLoaderOverLay } from '../styles/ToolbarAreaPane';
import { imgsrc } from '../../../utils/imgsrc';
import { DEVICES_LABEL, DEVICES_TYPE_CONST } from '../../../constants';
import {
  Confirm as ConfirmDialog,
  Selection as SelectionDialog
} from '../../../components/DialogBox';

export default class ToolbarAreaPane extends PureComponent {
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
    const isMtp = deviceType === DEVICES_TYPE_CONST.mtp;

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

      return _activeToolbarList;
    });

    return _activeToolbarList;
  };

  render() {
    const {
      directoryLists,
      mtpDevice,
      styles,
      sidebarFavouriteList,
      deviceType,
      showMenu,
      currentBrowsePath,
      mtpStoragesList,
      toggleDeleteConfirmDialog,
      toggleMtpStorageSelectionDialog,
      toolbarList,
      isLoadedDirectoryLists,
      toggleDrawer,
      handleDeleteConfirmDialog,
      handleMtpStoragesListClick,
      handleToggleDrawer,
      fetchDirList,
      handleDoubleClickToolBar,
      handleToolbarAction
    } = this.props;

    const _toolbarList = this.activeToolbarList({
      toolbarList,
      directoryLists,
      currentBrowsePath,
      deviceType,
      mtpStoragesList,
      mtpDevice
    });

    return (
      <div className={styles.root}>
        <ConfirmDialog
          fullWidthDialog
          maxWidthDialog="xs"
          bodyText={`Are you sure you want to delete the items from your ${
            DEVICES_LABEL[deviceType]
          }?`}
          trigger={toggleDeleteConfirmDialog}
          onClickHandler={handleDeleteConfirmDialog}
        />
        <SelectionDialog
          titleText="Select Storage Option"
          list={mtpStoragesList}
          id="selectionDialog"
          showDiskAvatars
          open={
            deviceType === DEVICES_TYPE_CONST.mtp &&
            toggleMtpStorageSelectionDialog
          }
          onClose={handleMtpStoragesListClick}
        />
        <Drawer open={toggleDrawer} onClose={handleToggleDrawer(false)}>
          <div
            tabIndex={0}
            role="button"
            onClick={handleToggleDrawer(false)}
            onKeyDown={handleToggleDrawer(false)}
          />
          <SidebarAreaPaneLists
            onClickHandler={fetchDirList}
            sidebarFavouriteList={sidebarFavouriteList}
            deviceType={deviceType}
            currentBrowsePath={currentBrowsePath[deviceType]}
          />
        </Drawer>

        {!isLoadedDirectoryLists && <LazyLoaderOverLay />}

        <AppBar position="static" elevation={0} className={styles.appBar}>
          <Toolbar
            className={styles.toolbar}
            disableGutters
            onDoubleClick={event => {
              handleDoubleClickToolBar(event);
            }}
          >
            {showMenu && (
              <IconButton color="inherit" onClick={handleToggleDrawer(true)}>
                <MenuIcon />
              </IconButton>
            )}

            <div className={styles.toolbarInnerWrapper}>
              {Object.keys(_toolbarList).map(a => {
                const item = _toolbarList[a];
                return (
                  <Tooltip key={a} title={item.label}>
                    <div className={`${styles.navBtns} ${styles.noAppDrag}`}>
                      <IconButton
                        aria-label={item.label}
                        disabled={!item.enabled}
                        onClick={() => handleToolbarAction(a)}
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
