'use strict';

import React, { PureComponent } from 'react';
import FileExplorerTableRowsRender from './FileExplorerTableBodyListRender';
import { quickHash } from '../../../utils/funcs';

export default class FileExplorerTableBodyListWrapperRender extends PureComponent {
  constructor(props) {
    super(props);

    const { tableSort } = this.props;

    this.recursiveFilesFetchTimeOut = null;
    this.filesPreFetchCount = 50;
    this.state = {
      items: tableSort.slice(0, this.filesPreFetchCount)
    };
  }

  componentDidMount() {
    const { tableSort } = this.props;

    this.recursiveFilesFetch(tableSort);
  }

  componentWillReceiveProps({
    tableSort: nextTableSort,
    directoryGeneratedTime: nextDirectoryGeneratedTime
  }) {
    const { directoryGeneratedTime } = this.props;

    if (nextDirectoryGeneratedTime !== directoryGeneratedTime) {
      this.recursiveFilesFetch(nextTableSort);
    }
  }

  componentWillUnmount() {
    this.clearRecursiveFilesFetchTimeOut();
  }

  recursiveFilesFetch = tableSort => {
    const { items } = this.state;

    this.recursiveFilesFetchTimeOut = setTimeout(() => {
      const hasMore = items.length + 1 < tableSort.length;

      this.setState(({ items: prevItems }) => ({
        items: tableSort.slice(0, prevItems.length + this.filesPreFetchCount)
      }));

      if (hasMore) {
        this.recursiveFilesFetch(tableSort);
      } else {
        this.clearRecursiveFilesFetchTimeOut();
        return null;
      }
    }, 0);
  };

  clearRecursiveFilesFetchTimeOut() {
    if (this.recursiveFilesFetchTimeOut) {
      clearTimeout(this.recursiveFilesFetchTimeOut);
      this.recursiveFilesFetchTimeOut = null;
    }
  }

  render() {
    const { isSelected, ...parentProps } = this.props;
    const { items } = this.state;

    return items.map(item => {
      return (
        <FileExplorerTableRowsRender
          key={quickHash(item.path)}
          item={item}
          isSelected={isSelected(item.path)}
          {...parentProps}
        />
      );
    });
  }
}
