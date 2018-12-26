'use strict';

import React, { PureComponent } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import FileExplorerTableHeadRender from './FileExplorerTableHeadRender';
import { FileExplorerEmptyRowRender } from './FileExplorerEmptyRowRender';
import { FileExplorerTableRowsRender } from './FileExplorerTableRowsRender';

import { quickHash } from '../../../utils/funcs';
import { DEVICES_TYPE_CONST } from '../../../constants';

export class FileExplorerTableRender extends PureComponent {
  constructor(props) {
    super(props);
  }

  isSelected = path => {
    const { directoryLists, deviceType } = this.props;
    const _directoryLists = directoryLists[deviceType].queue.selected;

    return _directoryLists.indexOf(path) !== -1;
  };

  render() {
    const {
      styles,
      deviceType,
      hideColList,
      currentBrowsePath,
      directoryLists,
      mtpDevice,
      tableSort,
      onSelectAllClick,
      onRequestSort,
      onContextMenuClick,
      onTableDoubleClick,
      onTableClick,
      onIsDraggable,
      onDragStart
    } = this.props;
    const { nodes, order, orderBy, queue } = directoryLists[deviceType];
    const { selected } = queue;
    const emptyRows = nodes.length < 1;
    const isMtp = deviceType === DEVICES_TYPE_CONST.mtp;

    return (
      <Table className={styles.table}>
        <FileExplorerTableHeadRender
          numSelected={selected.length}
          order={order}
          orderBy={orderBy}
          onSelectAllClick={onSelectAllClick.bind(this, deviceType)}
          onRequestSort={onRequestSort.bind(this, deviceType)}
          rowCount={nodes ? nodes.length : 0}
          hideColList={hideColList}
        />
        <TableBody
          draggable={onIsDraggable(deviceType)}
          onDragStart={e => {
            onDragStart(e, {
              sourceDeviceType: deviceType
            });
          }}
        >
          {emptyRows ? (
            <FileExplorerEmptyRowRender
              styles={styles}
              mtpDevice={mtpDevice}
              isMtp={isMtp}
              onContextMenuClick={onContextMenuClick}
            />
          ) : (
            tableSort({
              nodes,
              order,
              orderBy
            }).map(item => {
              return (
                <FileExplorerTableRowsRender
                  key={quickHash(item.path)}
                  item={item}
                  isSelected={this.isSelected(item.path)}
                  styles={styles}
                  deviceType={deviceType}
                  hideColList={hideColList}
                  currentBrowsePath={currentBrowsePath}
                  directoryLists={directoryLists}
                  onContextMenuClick={onContextMenuClick}
                  onTableClick={onTableClick}
                  onTableDoubleClick={onTableDoubleClick}
                />
              );
            })
          )}
        </TableBody>
      </Table>
    );
  }
}
