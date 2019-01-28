'use strict';

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
  undefinedOrNull
} from '../../../utils/funcs';
import { DEVICES_TYPE_CONST } from '../../../constants';

class FileExplorerBodyRender extends PureComponent {
  constructor(props) {
    super(props);

    this.fileExplorerKeymapString = null;
    this.focussedFileExplorerDeviceTypeCached = DEVICES_TYPE_CONST.local;
  }

  componentDidMount() {
    this.accelerators();
  }

  componentWillUnmount() {
    hotkeys.unbind(this.fileExplorerKeymapString);
  }

  accelerators = () => {
    const keymapActionsList = {
      newFolder: this.acceleratorNewFolder,
      copy: this.acceleratorCreateAction,
      paste: this.acceleratorCreateAction,
      delete: this.acceleratorCreateAction,
      refresh: this.acceleratorCreateAction,
      up: this.acceleratorCreateAction,
      selectAll: this.acceleratorCreateAction,
      rename: this.acceleratorRename,
      open: this.acceleratorCreateAction,
      fileExplorerTabSwitch: this.acceleratorFileExplorerTabSwitch
    };

    this.fileExplorerKeymapString = Object.keys(fileExplorerKeymaps).reduce(
      (accumulator, currentValue) => {
        const itemCurrentValue = fileExplorerKeymaps[currentValue];

        if (undefinedOrNull(accumulator) || accumulator.trim() === '') {
          return itemCurrentValue.join(', ');
        }

        return `${accumulator}, ${itemCurrentValue.join(', ')}`;
      },
      ''
    );

    hotkeys(this.fileExplorerKeymapString, (event, handler) => {
      Object.keys(fileExplorerKeymaps).map(a => {
        const item = fileExplorerKeymaps[a];
        if (item.indexOf(handler.key) === -1) {
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

  acceleratorNewFolder = event => {
    const { onAcceleratorActivation, deviceType } = this.props;

    onAcceleratorActivation({
      type: 'newFolder',
      data: {
        event,
        tableData: this.tableData(),
        deviceType
      }
    });
  };

  acceleratorRename = event => {
    const { onAcceleratorActivation, deviceType } = this.props;

    onAcceleratorActivation({
      type: 'rename',
      data: {
        event,
        tableData: this.tableData(),
        deviceType
      }
    });
  };

  acceleratorFileExplorerTabSwitch = (event, type, toggle = true) => {
    const { onFocussedFileExplorerDeviceType, deviceType } = this.props;
    let _focussedFileExplorerDeviceType = null;

    if (toggle) {
      this.focussedFileExplorerDeviceTypeCached = toggleFileExplorerDeviceType(
        this.focussedFileExplorerDeviceTypeCached,
        DEVICES_TYPE_CONST
      );

      _focussedFileExplorerDeviceType = this
        .focussedFileExplorerDeviceTypeCached;
    } else {
      _focussedFileExplorerDeviceType = deviceType;
    }

    onFocussedFileExplorerDeviceType(toggle, _focussedFileExplorerDeviceType);
  };

  acceleratorCreateAction = (event, type) => {
    const { onAcceleratorActivation, deviceType } = this.props;

    onAcceleratorActivation({
      type,
      data: {
        event,
        deviceType
      }
    });
  };

  tableData = () => {
    const { deviceType, currentBrowsePath, directoryLists } = this.props;
    return {
      path: currentBrowsePath[deviceType],
      directoryLists: directoryLists[deviceType]
    };
  };

  render() {
    const {
      classes: styles,
      deviceType,
      currentBrowsePath,
      OnHoverDropZoneActivate,
      filesDrag, // eslint-disable-line no-unused-vars
      onContextMenuClick,
      onFilesDragOver,
      onFilesDragEnd,
      onTableDrop,
      onBreadcrumbPathClick,
      ...parentProps
    } = this.props;

    const _eventTarget = 'tableWrapperTarget';

    return (
      <Paper
        onClick={event =>
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
          className={classNames(styles.tableWrapper, {
            [`onHoverDropZone`]: OnHoverDropZoneActivate(deviceType)
          })}
          onContextMenu={event =>
            onContextMenuClick(event, {}, { ...this.tableData() }, _eventTarget)
          }
          onDragOver={event => {
            onFilesDragOver(event, {
              destinationDeviceType: deviceType
            });
          }}
          onDragEnd={event => {
            onFilesDragEnd(event);
          }}
          onDrop={event => {
            onTableDrop(event);
          }}
        >
          <FileExplorerTableBodyRender
            tableData={this.tableData()}
            deviceType={deviceType}
            currentBrowsePath={currentBrowsePath}
            onContextMenuClick={onContextMenuClick}
            {...parentProps}
          />
        </div>
        <FileExplorerTableFooterRender
          deviceType={deviceType}
          currentBrowsePath={currentBrowsePath}
          onBreadcrumbPathClick={onBreadcrumbPathClick}
        />
      </Paper>
    );
  }
}

export default withStyles(styles)(FileExplorerBodyRender);
