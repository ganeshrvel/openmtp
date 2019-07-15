'use strict';

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import FileExplorerTableGridRender from './FileExplorerTableBodyGridRender';
import { quickHash } from '../../../utils/funcs';
import { styles } from '../styles/FileExplorerTableBodyGridWrapperRender';

class FileExplorerTableBodyGridWrapperRender extends PureComponent {
  constructor(props) {
    super(props);

    const { tableSort } = this.props;

    this.recursiveFilesFetchTimeOut = null;
    this.filesPreFetchCount = 50;
    this.state = {
      items: tableSort.slice(0, this.filesPreFetchCount)
    };

    this.state = {
      items: []
    };

    this.prevInQueueList = [];
  }

  componentDidMount() {
    const { tableSort } = this.props;

    this.recursiveFilesFetch(tableSort);
  }

  componentWillReceiveProps({
    classes, // eslint-disable-line no-unused-vars
    tableSort: nextTableSort,
    directoryGeneratedTime: nextDirectoryGeneratedTime,
    directoryLists: nextDirectoryLists,
    ...nextParentProps
  }) {
    const {
      directoryGeneratedTime,
      directoryLists,
      deviceType,
      isSelected
    } = this.props;
    const prevDirectoryLists = directoryLists[deviceType].queue.selected;

    if (nextDirectoryGeneratedTime !== directoryGeneratedTime) {
      this.clearRecursiveFilesFetchTimeOut();

      this.prevInQueueList = [];
      this.recursiveFilesFetch(nextTableSort);
    } else if (prevDirectoryLists !== nextDirectoryLists) {
      const nextInQueueList = [];

      nextTableSort.map((item, index) => {
        if (isSelected(item.path)) {
          nextInQueueList.push(index);
        }

        return item;
      });

      [...this.prevInQueueList, ...nextInQueueList].map(index => {
        this.setState(({ items }) => {
          const _items = items;
          const item = nextTableSort[index];

          _items[index] = (
            <FileExplorerTableGridRender
              {...nextParentProps}
              key={quickHash(item.path)}
              item={item}
              isSelected={nextInQueueList.indexOf(index) > -1}
            />
          );

          return {
            items: _items
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

  recursiveFilesFetch = tableSort => {
    const { items } = this.state;

    this.recursiveFilesFetchTimeOut = setTimeout(() => {
      // eslint-disable-next-line no-unused-vars
      const { classes: styles, isSelected, ...parentProps } = this.props;
      const hasMore = items.length + 1 < tableSort.length;

      this.setState(({ items: prevItems }) => {
        const slicedItems = tableSort.slice(
          0,
          prevItems.length + this.filesPreFetchCount
        );

        const mappedSlicedItems = slicedItems.map(item => {
          return (
            <FileExplorerTableGridRender
              key={quickHash(item.path)}
              item={item}
              isSelected={isSelected(item.path)}
              {...parentProps}
            />
          );
        });

        return {
          items: mappedSlicedItems
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
    const { classes: styles } = this.props;
    const { items } = this.state;

    return (
      <TableRow>
        <TableCell colSpan={6} className={styles.gridTableCell}>
          <div className={styles.wrapper}>{items}</div>
        </TableCell>
      </TableRow>
    );
  }
}

export default withStyles(styles)(FileExplorerTableBodyGridWrapperRender);
