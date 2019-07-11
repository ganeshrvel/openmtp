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
    const { classes: styles, isSelected, ...parentProps } = this.props;
    const { items } = this.state;

    return (
      <TableRow>
        <TableCell colSpan={6} className={styles.gridTableCell}>
          <div className={styles.wrapper}>
            {items.map(item => {
              return (
                <FileExplorerTableGridRender
                  key={quickHash(item.path)}
                  item={item}
                  isSelected={isSelected(item.path)}
                  {...parentProps}
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
