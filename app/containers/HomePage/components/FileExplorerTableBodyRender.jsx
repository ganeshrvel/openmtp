'use strict';

import React, { PureComponent } from 'react';
import { styles } from '../styles/FileExplorerTableBodyRender';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import FileExplorerTableHeadRender from './FileExplorerTableHeadRender';
import FileExplorerTableEmptyRowRender from './FileExplorerTableEmptyRowRender';
import FileExplorerTableRowsRender from './FileExplorerTableRowsRender';
import FileExplorerTableGridRender from './FileExplorerTableGridRender';

import { quickHash } from '../../../utils/funcs';
import {
  DEVICES_TYPE_CONST,
  FILE_EXPLORER_LISTING_TYPE
} from '../../../constants';

class FileExplorerTableBodyRender extends PureComponent {
  constructor(props) {
    super(props);
  }

  isSelected = path => {
    const { directoryLists, deviceType } = this.props;
    const _directoryLists = directoryLists[deviceType].queue.selected;

    return _directoryLists.indexOf(path) !== -1;
  };

  RenderItems = (type = 'grid') => {
    const {
      classes: styles,
      deviceType,
      hideColList,
      tableData,
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

    const { nodes, order, orderBy } = directoryLists[deviceType];

    const _eventTarget = 'tableCellTarget';

    switch (type) {
      case 'grid':
      default:
        return (
          <TableRow>
            <TableCell colSpan={6} className={styles.gridTableCell}>
              <div className={styles.wrapper}>
                {tableSort({
                  nodes,
                  order,
                  orderBy
                }).map(item => {
                  return (
                    <FileExplorerTableGridRender
                      key={quickHash(item.path)}
                      item={item}
                      deviceType={deviceType}
                      hideColList={hideColList}
                      currentBrowsePath={currentBrowsePath}
                      directoryLists={directoryLists}
                      mtpDevice={mtpDevice}
                      tableSort={tableSort}
                      tableData={tableData}
                      isSelected={this.isSelected(item.path)}
                      _eventTarget={_eventTarget}
                      onSelectAllClick={onSelectAllClick}
                      onRequestSort={onRequestSort}
                      onContextMenuClick={onContextMenuClick}
                      onTableDoubleClick={onTableDoubleClick}
                      onTableClick={onTableClick}
                      onIsDraggable={onIsDraggable}
                      onDragStart={onDragStart}
                    />
                  );
                })}
              </div>
            </TableCell>
          </TableRow>
        );
        break;

      case 'list':
        return tableSort({
          nodes,
          order,
          orderBy
        }).map(item => {
          return (
            <FileExplorerTableRowsRender
              key={quickHash(item.path)}
              item={item}
              isSelected={this.isSelected(item.path)}
              tableData={tableData}
              _eventTarget={_eventTarget}
              deviceType={deviceType}
              hideColList={hideColList}
              currentBrowsePath={currentBrowsePath}
              directoryLists={directoryLists}
              onContextMenuClick={onContextMenuClick}
              onTableClick={onTableClick}
              onTableDoubleClick={onTableDoubleClick}
            />
          );
        });
        break;
    }
  };

  render() {
    const {
      classes: styles,
      deviceType,
      hideColList,
      currentBrowsePath,
      directoryLists,
      mtpDevice,
      onSelectAllClick,
      onRequestSort,
      onContextMenuClick,
      onIsDraggable,
      onDragStart
    } = this.props;
    const { nodes, order, orderBy, queue } = directoryLists[deviceType];
    const { selected } = queue;
    const emptyRows = nodes.length < 1;
    const isMtp = deviceType === DEVICES_TYPE_CONST.mtp;

    return (
      <React.Fragment>
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
            onDragStart={event => {
              onDragStart(event, {
                sourceDeviceType: deviceType
              });
            }}
          >
            {emptyRows ? (
              <FileExplorerTableEmptyRowRender
                mtpDevice={mtpDevice}
                isMtp={isMtp}
                currentBrowsePath={currentBrowsePath}
                deviceType={deviceType}
                directoryLists={directoryLists}
                onContextMenuClick={onContextMenuClick}
              />
            ) : (
              this.RenderItems(FILE_EXPLORER_LISTING_TYPE)
            )}
          </TableBody>
        </Table>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(FileExplorerTableBodyRender);
