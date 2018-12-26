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
      mtpDevice
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
            [`onHoverDropZone`]: this.handleOnHoverDropZoneActivate(deviceType)
          })}
          onContextMenu={event =>
            this._handleContextMenuClick(
              event,
              {},
              { ...tableData },
              _eventTarget
            )
          }
          onDragOver={e => {
            this.handleFilesDragOver(e, {
              destinationDeviceType: deviceType
            });
          }}
          onDragEnd={e => {
            this.handleFilesDragEnd(e);
          }}
          onDrop={e => {
            this.handleTableDrop(e);
          }}
        >
          <FileExplorerTableRender
            styles={styles}
            deviceType={deviceType}
            hideColList={hideColList}
            currentBrowsePath={currentBrowsePath}
            directoryLists={directoryLists}
            mtpDevice={mtpDevice}
            tableSort={this.tableSort}
            onSelectAllClick={this._handleSelectAllClick}
            onRequestSort={this._handleRequestSort}
            onContextMenuClick={this._handleContextMenuClick}
            onTableDoubleClick={this.handleTableDoubleClick}
            onTableClick={this._handleTableClick}
            onIsDraggable={this.handleIsDraggable}
            onDragStart={this.handleFilesDragStart}
          />
        </div>
        <FileExplorerTableFooterRender
          styles={styles}
          currentBrowsePath={currentBrowsePath}
          deviceType={deviceType}
          onBreadcrumbPathClick={this._handleBreadcrumbPathClick}
        />
      </Paper>
    );
  }
}
