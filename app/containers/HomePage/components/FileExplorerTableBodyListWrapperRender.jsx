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
      items: tableSort.slice(0, this.filesPreFetchCount),
    };

    this.state = {
      items: [],
    };

    this.prevInQueueList = [];
  }

  componentDidMount() {
    const { tableSort } = this.props;

    this.recursiveFilesFetch(tableSort);
  }

  componentWillReceiveProps({
    tableSort: nextTableSort,
    directoryGeneratedTime: nextDirectoryGeneratedTime,
    directoryLists: nextDirectoryLists,
    ...nextParentProps
  }) {
    const {
      directoryGeneratedTime,
      directoryLists,
      deviceType,
      isSelected,
    } = this.props;
    const prevSelectedDirectoryLists =
      directoryLists[deviceType].queue.selected;
    const nextSelectedDirectoryLists =
      nextDirectoryLists[deviceType].queue.selected;

    if (nextDirectoryGeneratedTime !== directoryGeneratedTime) {
      this.clearRecursiveFilesFetchTimeOut();

      this.prevInQueueList = [];
      this.recursiveFilesFetch(nextTableSort);
    } else if (prevSelectedDirectoryLists !== nextSelectedDirectoryLists) {
      const nextInQueueList = [];

      nextTableSort.map((item, index) => {
        if (isSelected(item.path)) {
          nextInQueueList.push(index);
        }

        return item;
      });

      [...this.prevInQueueList, ...nextInQueueList].map((index) => {
        this.setState(({ items }) => {
          const _items = items;
          const item = nextTableSort[index];

          _items[index] = (
            <FileExplorerTableRowsRender
              {...nextParentProps}
              key={quickHash(item.path)}
              item={item}
              isSelected={nextInQueueList.indexOf(index) > -1}
            />
          );

          return {
            items: _items,
          };
        });

        return index;
      });

      this.prevInQueueList = nextInQueueList;
    }
  }

  componentWillUnmount() {
    this.clearRecursiveFilesFetchTimeOut();
  }

  recursiveFilesFetch = (tableSort) => {
    const { items } = this.state;

    this.recursiveFilesFetchTimeOut = setTimeout(() => {
      const { isSelected, ...parentProps } = this.props;
      const hasMore = items.length + 1 < tableSort.length;

      this.setState(({ items: prevItems }) => {
        const slicedItems = tableSort.slice(
          0,
          prevItems.length + this.filesPreFetchCount
        );

        const mappedSlicedItems = slicedItems.map((item) => {
          return (
            <FileExplorerTableRowsRender
              {...parentProps}
              key={quickHash(item.path)}
              item={item}
              isSelected={isSelected(item.path)}
            />
          );
        });

        return {
          items: mappedSlicedItems,
        };
      });

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
    const { items } = this.state;

    return items;
  }
}
