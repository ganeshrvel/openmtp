'use strict';

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import classNames from 'classnames';
import FileExplorerTableBodyRender from './FileExplorerTableBodyRender';
import FileExplorerTableFooterRender from './FileExplorerTableFooterRender';
import { styles } from '../styles/FileExplorerBodyRender';

class FileExplorerBodyRender extends PureComponent {
  render() {
    const {
      classes: styles,
      deviceType,
      fileExplorerListingType,
      hideColList,
      currentBrowsePath,
      directoryLists,
      mtpDevice,
      OnHoverDropZoneActivate,
      filesDrag, // eslint-disable-line no-unused-vars
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
      <Paper className={styles.root} elevation={0} square>
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
          <FileExplorerTableBodyRender
            deviceType={deviceType}
            fileExplorerListingType={fileExplorerListingType}
            hideColList={hideColList}
            currentBrowsePath={currentBrowsePath}
            directoryLists={directoryLists}
            mtpDevice={mtpDevice}
            tableData={tableData}
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
          currentBrowsePath={currentBrowsePath}
          deviceType={deviceType}
          onBreadcrumbPathClick={onBreadcrumbPathClick}
        />
      </Paper>
    );
  }
}

export default withStyles(styles)(FileExplorerBodyRender);
