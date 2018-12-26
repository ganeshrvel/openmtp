'use strict';

import React, { PureComponent } from 'react';
import Paper from '@material-ui/core/Paper';
import classNames from 'classnames';
import { FileExplorerTableRender } from './FileExplorerTableRender';
import { FileExplorerTableFooterRender } from './FileExplorerTableFooterRender';

export class FileExplorerBodyRender extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      styles,
      deviceType,
      hideColList,
      currentBrowsePath,
      directoryLists,
      mtpDevice,
      OnHoverDropZoneActivate,
      filesDrag,
      tableSort,
      onContextMenuClick,
      onFilesDragOver,
      onFilesDragEnd,
      onTableDrop,
      onSelectAllClick,
      onRequestSort,
      onTableDoubleClick,
      onTableClick,
      onIsDraggable,
      onDragStart,
      onBreadcrumbPathClick
    } = this.props;

    const tableData = {
      path: currentBrowsePath[deviceType],
      directoryLists: directoryLists[deviceType]
    };

    const _eventTarget = 'tableWrapperTarget';

    return (
      <Paper className={styles.root} elevation={0} square={true}>
        <div
          className={classNames(styles.tableWrapper, {
            [`onHoverDropZone`]: OnHoverDropZoneActivate(deviceType)
          })}
          onContextMenu={event =>
            onContextMenuClick(event, {}, { ...tableData }, _eventTarget)
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
          <FileExplorerTableRender
            styles={styles}
            deviceType={deviceType}
            hideColList={hideColList}
            currentBrowsePath={currentBrowsePath}
            directoryLists={directoryLists}
            mtpDevice={mtpDevice}
            tableSort={tableSort}
            onSelectAllClick={onSelectAllClick}
            onRequestSort={onRequestSort}
            onContextMenuClick={onContextMenuClick}
            onTableDoubleClick={onTableDoubleClick}
            onTableClick={onTableClick}
            onIsDraggable={onIsDraggable}
            onDragStart={onDragStart}
          />
        </div>
        <FileExplorerTableFooterRender
          styles={styles}
          currentBrowsePath={currentBrowsePath}
          deviceType={deviceType}
          onBreadcrumbPathClick={onBreadcrumbPathClick}
        />
      </Paper>
    );
  }
}
