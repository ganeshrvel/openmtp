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
import { undefinedOrNull } from '../../../utils/funcs';

class FileExplorerBodyRender extends PureComponent {
  componentDidMount() {
    this.accelerators();
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
      open: this.acceleratorCreateAction,
      rename: this.acceleratorRename
    };

    const fileExplorerKeymapString = Object.keys(fileExplorerKeymaps).reduce(
      (accumulator, currentValue) => {
        const itemCurrentValue = fileExplorerKeymaps[currentValue];

        if (undefinedOrNull(accumulator) || accumulator.trim() === '') {
          return itemCurrentValue.join(', ');
        }

        return `${accumulator}, ${itemCurrentValue.join(', ')}`;
      },
      ''
    );

    hotkeys(fileExplorerKeymapString, (event, handler) => {
      Object.keys(fileExplorerKeymaps).map(a => {
        const item = fileExplorerKeymaps[a];
        if (item.indexOf(handler.key) === -1) {
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

  currentMouseHover = type => {
    const { onFocussedFileExplorerDeviceType, deviceType } = this.props;
    const curentFocussedDeviceType = type === 'enter' ? deviceType : null;

    onFocussedFileExplorerDeviceType(curentFocussedDeviceType);
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
        onFocus={() => {}}
        onMouseOver={() => this.currentMouseHover('enter')}
        onMouseLeave={() => this.currentMouseHover('leave')}
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
