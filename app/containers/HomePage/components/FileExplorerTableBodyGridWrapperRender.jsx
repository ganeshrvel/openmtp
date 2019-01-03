'use strict';

import React, { PureComponent } from 'react';
import { styles } from '../styles/FileExplorerTableBodyGridWrapperRender';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import FileExplorerTableGridRender from './FileExplorerTableBodyGridRender';
import { quickHash } from '../../../utils/funcs';

class FileExplorerTableBodyGridWrapperRender extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      classes: styles,
      deviceType,
      hideColList,
      _eventTarget,
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
      onDragStart,
      isSelected
    } = this.props;

    const { nodes, order, orderBy } = directoryLists[deviceType];

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
                  isSelected={isSelected(item.path)}
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
  }
}

export default withStyles(styles)(FileExplorerTableBodyGridWrapperRender);
