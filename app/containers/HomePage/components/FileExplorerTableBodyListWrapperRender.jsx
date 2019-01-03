'use strict';

import React, { PureComponent } from 'react';
import FileExplorerTableRowsRender from './FileExplorerTableBodyListRender';
import { quickHash } from '../../../utils/funcs';

export default class FileExplorerTableBodyListWrapperRender extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      deviceType,
      hideColList,
      _eventTarget,
      tableData,
      currentBrowsePath,
      directoryLists,
      tableSort,
      onContextMenuClick,
      onTableDoubleClick,
      onTableClick,
      isSelected
    } = this.props;

    const { nodes, order, orderBy } = directoryLists[deviceType];

    return tableSort({
      nodes,
      order,
      orderBy
    }).map(item => {
      return (
        <FileExplorerTableRowsRender
          key={quickHash(item.path)}
          item={item}
          isSelected={isSelected(item.path)}
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
  }
}
