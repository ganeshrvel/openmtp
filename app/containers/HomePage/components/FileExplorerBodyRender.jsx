import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import classNames from 'classnames';
import hotkeys from 'hotkeys-js';
import FileExplorerTableBodyRender from './FileExplorerTableBodyRender';
import FileExplorerTableFooterRender from './FileExplorerTableFooterRender';
import { styles } from '../styles/FileExplorerBodyRender';
import { fileExplorerKeymaps } from '../../../constants/keymaps';
import {
  isFileExplorerOnFocus,
  toggleFileExplorerDeviceType,
  undefinedOrNull,
} from '../../../utils/funcs';
import { FILE_EXPLORER_DEFAULT_FOCUSSED_DEVICE_TYPE } from '../../../constants';
import { FILE_EXPLORER_BODY_WRAPPER_ID } from '../../../constants/dom';
import { DEVICE_TYPE } from '../../../enums';

class FileExplorerBodyRender extends PureComponent {
  constructor(props) {
    super(props);
    const { deviceType } = this.props;

    this.fileExplorerKeymapString = null;
    this.focussedFileExplorerDeviceTypeCached =
      FILE_EXPLORER_DEFAULT_FOCUSSED_DEVICE_TYPE;
    this.fileExplorerBodyWrapperId = `${FILE_EXPLORER_BODY_WRAPPER_ID}-${deviceType}`;
    this.acceleratorIgnoreList = ['multipleSelectClick'];
  }

  componentDidMount() {
    this.accelerators();
    this.focusItem();

    this.fileExplorerBodyWrapper = document.getElementById(
      this.fileExplorerBodyWrapperId
    );
  }

  componentWillUnmount() {
    hotkeys.unbind(this.fileExplorerKeymapString);
  }

  focusItem = () => {
    const { deviceType } = this.props;

    if (FILE_EXPLORER_DEFAULT_FOCUSSED_DEVICE_TYPE === deviceType) {
      document.getElementById(this.fileExplorerBodyWrapperId).focus();
    }
  };

  accelerators = () => {
    const keymapActionsList = {
      newFolder: this.acceleratorNewFolder,
      copy: this.acceleratorCreateAction,
      copyToQueue: this.acceleratorCreateAction,
      paste: this.acceleratorCreateAction,
      delete: this.acceleratorCreateAction,
      refresh: this.acceleratorCreateAction,
      up: this.acceleratorCreateAction,
      selectAll: this.acceleratorCreateAction,
      rename: this.acceleratorRename,
      open: this.acceleratorCreateAction,
      fileExplorerTabSwitch: this.acceleratorFileExplorerTabSwitch,
      navigationRight: this.acceleratorCreateAction,
      navigationLeft: this.acceleratorCreateAction,
      navigationUp: this.acceleratorCreateAction,
      navigationDown: this.acceleratorCreateAction,
      multipleSelectLeft: this.acceleratorCreateAction,
      multipleSelectRight: this.acceleratorCreateAction,
      multipleSelectUp: this.acceleratorCreateAction,
      multipleSelectDown: this.acceleratorCreateAction,
    };

    this.fileExplorerKeymapString = Object.keys(fileExplorerKeymaps).reduce(
      (accumulator, currentKey) => {
        const itemCurrentKey = fileExplorerKeymaps[currentKey].keys;

        if (this.acceleratorIgnoreList.indexOf(currentKey) !== -1) {
          return accumulator;
        }

        if (undefinedOrNull(accumulator) || accumulator.trim() === '') {
          return itemCurrentKey.join(', ');
        }

        return `${accumulator}, ${itemCurrentKey.join(', ')}`;
      },
      ''
    );

    hotkeys(this.fileExplorerKeymapString, (event, handler) => {
      Object.keys(fileExplorerKeymaps).map((a) => {
        const item = fileExplorerKeymaps[a].keys;

        if (
          undefinedOrNull(keymapActionsList[a]) ||
          undefinedOrNull(item) ||
          item.indexOf(handler.key) === -1
        ) {
          return null;
        }

        if (this.acceleratorIgnoreList.indexOf(a) !== -1) {
          return null;
        }

        /* We check if there are any overlays and whether the file explorer is in focus else not fire keymapactions */
        if (!isFileExplorerOnFocus()) {
          return null;
        }

        return keymapActionsList[a](event, a);
      });
    });
  };

  acceleratorNewFolder = (event) => {
    const { onAcceleratorActivation, deviceType } = this.props;

    onAcceleratorActivation({
      type: 'newFolder',
      data: {
        event,
        tableData: this.tableData(),
        deviceType,
      },
    });
  };

  acceleratorRename = (event) => {
    const { onAcceleratorActivation, deviceType } = this.props;

    onAcceleratorActivation({
      type: 'rename',
      data: {
        event,
        tableData: this.tableData(),
        deviceType,
      },
    });
  };

  acceleratorFileExplorerTabSwitch = (event, type, toggle = true) => {
    const { onFocussedFileExplorerDeviceType, deviceType } = this.props;
    let _focussedFileExplorerDeviceType = null;

    if (toggle) {
      this.focussedFileExplorerDeviceTypeCached = toggleFileExplorerDeviceType(
        this.focussedFileExplorerDeviceTypeCached,
        DEVICE_TYPE
      );

      _focussedFileExplorerDeviceType =
        this.focussedFileExplorerDeviceTypeCached;
    } else {
      _focussedFileExplorerDeviceType = deviceType;
    }

    if (
      `${FILE_EXPLORER_BODY_WRAPPER_ID}-${_focussedFileExplorerDeviceType}` ===
      this.fileExplorerBodyWrapperId
    ) {
      document.getElementById(this.fileExplorerBodyWrapperId).focus();
    }

    onFocussedFileExplorerDeviceType(toggle, _focussedFileExplorerDeviceType);
  };

  acceleratorCreateAction = (event, type) => {
    const { onAcceleratorActivation, deviceType } = this.props;

    onAcceleratorActivation({
      type,
      data: {
        event,
        deviceType,
      },
    });
  };

  tableData = () => {
    const { deviceType, currentBrowsePath, directoryLists } = this.props;

    return {
      path: currentBrowsePath[deviceType],
      directoryLists: directoryLists[deviceType],
    };
  };

  isExternalFileDragged = (event) => {
    const dt = event.dataTransfer;

    return (
      dt.types &&
      (dt.types.indexOf
        ? dt.types.indexOf('Files') !== -1
        : dt.types.contains('Files'))
    );
  };

  _handleOnDragOver = (event) => {
    const { deviceType, onFilesDragOver } = this.props;

    // if an extenal file is being dragged into the screen
    // then do not activate the local pane
    // because local files can only to be transferred to a mtp device
    if (this.isExternalFileDragged(event)) {
      if (deviceType === DEVICE_TYPE.local) {
        return false;
      }
    }

    onFilesDragOver(event, {
      destinationDeviceType: deviceType,
    });
  };

  _handleOnDragEnd = (event) => {
    const { deviceType, onFilesDragEnd } = this.props;

    // if an extenal file is being dragged into the screen
    // then do not activate the local pane
    // because local files can only to be transferred to a mtp device
    if (this.isExternalFileDragged(event)) {
      if (deviceType === DEVICE_TYPE.local) {
        return false;
      }
    }

    onFilesDragEnd(event, {
      destinationDeviceType: deviceType,
    });
  };

  _handleOnDrop = (event) => {
    event.preventDefault();

    const { deviceType, onFilesDrop } = this.props;

    onFilesDrop(event, {
      destinationDeviceType: deviceType,
      externalFiles: event?.dataTransfer?.files ?? [],
    });
  };

  _handleExternalFileDragLeave = (event) => {
    event.preventDefault();
    const { deviceType, onExternalFileDragLeave } = this.props;

    if (this.isExternalFileDragged(event)) {
      if (deviceType === DEVICE_TYPE.local) {
        return false;
      }

      // prevent dragleave being fired when hovering a child element
      const rect = this.fileExplorerBodyWrapper.getBoundingClientRect();

      if (
        event.clientY < rect.top ||
        event.clientY >= rect.bottom ||
        event.clientX < rect.left ||
        event.clientX >= rect.right
      ) {
        onExternalFileDragLeave(event, { deviceType });
      }
    }

    return false;
  };

  render() {
    const {
      classes: styles,
      deviceType,
      currentBrowsePath,
      onHoverDropZoneActivate,
      filesDrag, // eslint-disable-line no-unused-vars
      onContextMenuClick,
      onBreadcrumbPathClick,
      isStatusBarEnabled,
      fileTransferClipboard,
      mtpDevice,
      ...parentProps
    } = this.props;
    const { directoryLists } = this.props;

    const _eventTarget = 'tableWrapperTarget';

    return (
      <Paper
        onClick={(event) =>
          this.acceleratorFileExplorerTabSwitch(
            event,
            'fileExplorerTabSwitch',
            false
          )
        }
        className={styles.root}
        elevation={0}
        square
      >
        <div
          tabIndex={-1}
          id={this.fileExplorerBodyWrapperId}
          className={classNames(styles.tableWrapper, {
            [`onHoverDropZone`]: onHoverDropZoneActivate(deviceType),
            [`statusBarActive`]: isStatusBarEnabled,
          })}
          onContextMenu={(event) =>
            onContextMenuClick(event, {}, { ...this.tableData() }, _eventTarget)
          }
          onDragOver={this._handleOnDragOver}
          onDragEnd={this._handleOnDragEnd}
          onDrop={this._handleOnDrop}
          onDragLeave={this._handleExternalFileDragLeave}
        >
          <FileExplorerTableBodyRender
            tableData={this.tableData()}
            deviceType={deviceType}
            currentBrowsePath={currentBrowsePath}
            onContextMenuClick={onContextMenuClick}
            mtpDevice={mtpDevice}
            {...parentProps}
          />
        </div>
        <FileExplorerTableFooterRender
          deviceType={deviceType}
          currentBrowsePath={currentBrowsePath}
          onBreadcrumbPathClick={onBreadcrumbPathClick}
          isStatusBarEnabled={isStatusBarEnabled}
          directoryLists={directoryLists[deviceType]}
          fileTransferClipboard={fileTransferClipboard}
          mtpDevice={mtpDevice}
        />
      </Paper>
    );
  }
}

export default withStyles(styles)(FileExplorerBodyRender);
