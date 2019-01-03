'use strict';

import React, { PureComponent } from 'react';
import FileExplorerTableRowsRender from './FileExplorerTableBodyListRender';
import { quickHash } from '../../../utils/funcs';

export default class FileExplorerTableBodyListWrapperRender extends PureComponent {
  constructor(props) {
    super(props);

    this.recursiveFilesFetchTimeOut = null;
    this.filesPreFetchCount = 50;
    this.state = {
      items: this.props.tableSort.slice(0, this.filesPreFetchCount)
    };
  }

  componentDidMount() {
    this.recursiveFilesFetch();
  }

  componentWillUnmount() {
    this.clearRecursiveFilesFetchTimeOut();
  }

  componentWillUpdate(prevProps, prevState, snapshot) {
    if (prevProps.tableSort === this.props.tableSort) {
      return null;
    }

    this.recursiveFilesFetch();
  }

  recursiveFilesFetch = () => {
    this.recursiveFilesFetchTimeOut = setTimeout(() => {
      const hasMore = this.state.items.length + 1 < this.props.tableSort.length;

      this.setState((prev, props) => ({
        items: props.tableSort.slice(
          0,
          prev.items.length + this.filesPreFetchCount
        )
      }));

      if (hasMore) {
        this.recursiveFilesFetch();
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

    return this.state.items.map(item => {
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
