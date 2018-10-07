'use strict';

import React, { Component } from 'react';
import { styles } from '../styles/DirectoryListsTableHead';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';

const rows = [
  {
    id: 'path',
    numeric: false,
    disablePadding: false,
    label: 'Name'
  },
  {
    id: 'size',
    numeric: false,
    disablePadding: true,
    label: 'Size'
  },
  {
    id: 'dateAdded',
    numeric: false,
    disablePadding: true,
    label: 'Date Added'
  }
];

class DirectoryListsTableHead extends React.Component {
  constructor(props) {
    super(props);
  }

  createSortHandler = property => event => {
    this.props.onRequestSort(property, event);
  };

  render() {
    const {
      classes: styles,
      onSelectAllClick,
      order,
      orderBy,
      numSelected,
      rowCount
    } = this.props;

    return (
      <TableHead>
        <TableRow>
          <TableCell padding="none" className={styles.tableHeadCell}>
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={numSelected === rowCount}
              onChange={onSelectAllClick}
            />
          </TableCell>
          {rows.map(row => {
            return (
              <TableCell
                key={row.id}
                numeric={row.numeric}
                padding={row.disablePadding ? 'none' : 'default'}
                sortDirection={orderBy === row.id ? order : false}
                className={styles.tableHeadCell}
              >
                <Tooltip
                  title="Sort"
                  placement={row.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={orderBy === row.id}
                    direction={order}
                    onClick={this.createSortHandler(row.id)}
                  >
                    {row.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            );
          }, this)}
        </TableRow>
      </TableHead>
    );
  }
}

export default withStyles(styles)(DirectoryListsTableHead);
