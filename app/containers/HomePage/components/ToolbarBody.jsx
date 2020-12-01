import React, { PureComponent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import MenuIcon from '@material-ui/icons/Menu';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import {
  faSdCard,
  faBolt,
  faTerminal,
} from '@fortawesome/free-solid-svg-icons';
import SidebarAreaPaneLists from './SidebarAreaPaneLists';
import { LazyLoaderOverlay } from '../styles/ToolbarAreaPane';
import { DEVICES_LABEL } from '../../../constants';
import {
  Confirm as ConfirmDialog,
  Selection as SelectionDialog,
} from '../../../components/DialogBox';
import { DEVICE_TYPE, MTP_MODE } from '../../../enums';
import { capitalize, isEmpty } from '../../../utils/funcs';

export default class ToolbarAreaPane extends PureComponent {
  activeToolbarList = ({ ...args }) => {
    const {
      toolbarList,
      directoryLists,
      currentBrowsePath,
      deviceType,
      mtpStoragesList,
      mtpDevice,
      mtpMode,
    } = args;

    const _directoryLists = directoryLists[deviceType];
    const _currentBrowsePath = currentBrowsePath[deviceType];
    const _activeToolbarList = toolbarList[deviceType];
    const isMtp = deviceType === DEVICE_TYPE.mtp;

    let enabled = true;

    if (isMtp && mtpMode === MTP_MODE.kalam) {
      enabled = !mtpDevice.isLoading;
    }

    Object.keys(_activeToolbarList).map((a) => {
      const item = _activeToolbarList[a];

      switch (a) {
        case 'up':
          _activeToolbarList[a] = {
            ...item,
            enabled: _currentBrowsePath !== '/' && enabled,
          };
          break;

        case 'refresh':
          _activeToolbarList[a] = {
            ...item,
            enabled,
          };
          break;

        case 'delete':
          _activeToolbarList[a] = {
            ...item,
            enabled: _directoryLists.queue.selected.length > 0 && enabled,
          };
          break;

        case 'storage':
          _activeToolbarList[a] = {
            ...item,
            enabled:
              Object.keys(mtpStoragesList).length > 0 &&
              isMtp &&
              mtpDevice.isAvailable &&
              enabled,
          };
          break;

        case 'settings':
          _activeToolbarList[a] = {
            ...item,
          };
          break;

        case 'mtpMode':
          _activeToolbarList[a] = {
            ...item,
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
      toggleMtpModeSelectionDialog,
      toolbarList,
      isLoadedDirectoryLists,
      toggleDrawer,
      appThemeMode,
      onDeleteConfirmDialog,
      onMtpStoragesListClick,
      onMtpModeSelectionDialogClick,
      onToggleDrawer,
      onListDirectory,
      onDoubleClickToolBar,
      onToolbarAction,
      showLocalPaneOnLeftSide,
      mtpMode,
    } = this.props;

    const _toolbarList = this.activeToolbarList({
      toolbarList,
      directoryLists,
      currentBrowsePath,
      deviceType,
      mtpStoragesList,
      mtpDevice,
      mtpMode,
    });

    const RenderLazyLoaderOverlay = LazyLoaderOverlay({ appThemeMode });
    let _mtpStoragesList = [];

    if (!isEmpty(mtpStoragesList)) {
      _mtpStoragesList = Object.keys(mtpStoragesList).map((a) => {
        const item = mtpStoragesList[a];

        item.icon = faSdCard;
        item.value = a;

        return item;
      });
    }

    const mtpModeList = [
      {
        value: MTP_MODE.kalam,
        name: `${capitalize(MTP_MODE.kalam)} Mode`,
        icon: faBolt,
      },
      {
        value: MTP_MODE.legacy,
        name: `${capitalize(MTP_MODE.legacy)} Mode`,
        icon: faTerminal,
      },
    ];

    return (
      <div className={styles.root}>
        <ConfirmDialog
          fullWidthDialog
          maxWidthDialog="xs"
          bodyText={`Are you sure you want to permanently delete the items from your ${DEVICES_LABEL[deviceType]}?`}
          trigger={toggleDeleteConfirmDialog}
          onClickHandler={onDeleteConfirmDialog}
        />
        <SelectionDialog
          titleText="Select Storage Option"
          list={_mtpStoragesList}
          id="selectionDialog"
          showAvatar
          open={
            deviceType === DEVICE_TYPE.mtp && toggleMtpStorageSelectionDialog
          }
          onClose={onMtpStoragesListClick}
        />
        <SelectionDialog
          titleText="Select MTP Mode"
          list={mtpModeList}
          id="selectionDialog"
          showAvatar
          open={deviceType === DEVICE_TYPE.mtp && toggleMtpModeSelectionDialog}
          onClose={onMtpModeSelectionDialogClick}
        />
        <Drawer
          open={toggleDrawer}
          onClose={onToggleDrawer(false)}
          anchor={!showLocalPaneOnLeftSide ? 'right' : 'left'}
        >
          <div
            tabIndex={0}
            role="button"
            onClick={onToggleDrawer(false)}
            onKeyDown={onToggleDrawer(false)}
          />
          <SidebarAreaPaneLists
            onClickHandler={onListDirectory}
            sidebarFavouriteList={sidebarFavouriteList}
            deviceType={deviceType}
            currentBrowsePath={currentBrowsePath[deviceType]}
          />
        </Drawer>

        {!isLoadedDirectoryLists && <RenderLazyLoaderOverlay />}

        <AppBar position="static" elevation={0} className={styles.appBar}>
          <Toolbar
            className={styles.toolbar}
            disableGutters
            onDoubleClick={(event) => {
              onDoubleClickToolBar(event);
            }}
          >
            {showMenu && (
              <IconButton color="inherit" onClick={onToggleDrawer(true)}>
                <MenuIcon />
              </IconButton>
            )}

            <div className={styles.toolbarInnerWrapper}>
              {Object.keys(_toolbarList).map((a) => {
                const item = _toolbarList[a];

                return (
                  <Tooltip key={a} title={item.label}>
                    <div className={`${styles.navBtns} ${styles.noAppDrag}`}>
                      <IconButton
                        aria-label={item.label}
                        disabled={!item.enabled}
                        onClick={() => onToolbarAction(a)}
                        className={classNames({
                          [styles.disabledNavBtns]: !item.enabled,
                          [styles.invertedNavBtns]: item.invert,
                        })}
                      >
                        <FontAwesomeIcon
                          icon={item.icon}
                          className={styles.navBtnImgs}
                          title={item.label}
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
