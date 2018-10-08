'use strict';

import React, { Component } from 'react';
import { styles } from '../styles/DirectoryLists';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import FolderIcon from '@material-ui/icons/Folder';
import InsertDriveFile from '@material-ui/icons/InsertDriveFile';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import nanoid from 'nanoid';
import DirectoryListsTableHead from './DirectoryListsTableHead';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withReducer } from '../../../store/reducers/withReducer';
import reducers from '../reducers';
import { setSortingDirLists, setSelectedDirLists } from '../actions';
import { makeDirectoryLists, makeIsLoading } from '../selectors';

class DirectoryLists extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes: styles, deviceType } = this.props;
    const { nodes, order, orderBy, queue } = this.props.directoryLists[
      deviceType
    ];
    const { selected } = queue;

    const emptyRows = nodes.length < 1;
    return (
      <div>
        <Paper elevation={0} square={true} className={styles.root}>
          <div className={styles.tableWrapper}>
            <Table className={styles.table} aria-labelledby="tableTitle">
              <DirectoryListsTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={this.props.handleSelectAllClick.bind(
                  this,
                  deviceType
                )}
                onRequestSort={this.props.handleRequestSort.bind(
                  this,
                  deviceType
                )}
                rowCount={nodes ? nodes.length : 0}
              />
              <TableBody>
                {this.stableSort(nodes, this.getSorting(order, orderBy)).map(
                  n => {
                    return this.TableRowsRender(n, this.isSelected(n.path));
                  }
                )}
                {emptyRows && (
                  <TableRow className={styles.emptyTableRowWrapper}>
                    <TableCell colSpan={6} className={styles.tableCell} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {this.TableFooter()}
        </Paper>
      </div>
    );
  }

  TableRowsRender = (n, isSelected) => {
    const { classes: styles, deviceType } = this.props;
    return (
      <TableRow
        role="checkbox"
        aria-checked={isSelected}
        tabIndex={-1}
        key={nanoid(8)}
        selected={isSelected}
        className={classNames({
          [styles.tableRowSelected]: isSelected
        })}
      >
        <TableCell
          padding="none"
          className={`${styles.tableCell} checkboxCell`}
        >
          <Checkbox
            checked={isSelected}
            onClick={event => this.props.handleClick(n.path, deviceType, event)}
          />
        </TableCell>
        <TableCell padding="default" className={`${styles.tableCell} nameCell`}>
          {n.isFolder ? (
            <Tooltip title="Folder">
              <FolderIcon className={styles.tableCellIcon} fontSize="small" />
            </Tooltip>
          ) : (
            <Tooltip title="File">
              <InsertDriveFile
                className={styles.tableCellIcon}
                fontSize="small"
              />
            </Tooltip>
          )}
          &nbsp;&nbsp;
          {n.name}
        </TableCell>
        <TableCell padding="none" className={`${styles.tableCell} sizeCell`}>
          {n.size}
        </TableCell>
        <TableCell
          padding="none"
          className={`${styles.tableCell} dateAddedCell`}
        >
          {n.dateAdded}
        </TableCell>
      </TableRow>
    );
  };

  TableFooter = () => {
    return (
      <React.Fragment>
        <TableFooter component="div" className={styles.tableFooter}>
          <p>Breadcrumb</p>
        </TableFooter>
      </React.Fragment>
    );
  };

  isSelected = path =>
    this.props.directoryLists[this.props.deviceType].queue.selected.indexOf(
      path
    ) !== -1;

  stableSort = (array, cmp) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = cmp(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map(el => el[0]);
  };

  desc = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  getSorting = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => this.desc(a, b, orderBy)
      : (a, b) => -this.desc(a, b, orderBy);
  };
}

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      handleRequestSort: (deviceType, property, event) => (_, getState) => {
        const orderBy = property;
        const {
          orderBy: _orderBy,
          order: _order
        } = getState().Home.directoryLists[deviceType];
        let order = 'desc';

        if (_orderBy === property && _order === 'desc') {
          order = 'asc';
        }

        dispatch(setSortingDirLists({ order, orderBy }, deviceType));
      },

      handleSelectAllClick: (deviceType, event) => (_, getState) => {
        if (event.target.checked) {
          dispatch(
            setSelectedDirLists(
              {
                selected: getState().Home.directoryLists[deviceType].nodes.map(
                  n => n.path
                )
              },
              deviceType
            )
          );
          return;
        }

        dispatch(setSelectedDirLists({ selected: [] }, deviceType));
      },

      handleClick: (path, deviceType, event) => (_, getState) => {
        const { selected } = getState().Home.directoryLists[deviceType].queue;
        const selectedIndex = selected.indexOf(path);
        let newSelected = [];

        if (selectedIndex === -1) {
          newSelected = newSelected.concat(selected, path);
        } else if (selectedIndex === 0) {
          newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
          newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
          newSelected = newSelected.concat(
            selected.slice(0, selectedIndex),
            selected.slice(selectedIndex + 1)
          );
        }
        dispatch(setSelectedDirLists({ selected: newSelected }, deviceType));
      }
    },
    dispatch
  );

const mapStateToProps = (state, props) => {
  return {
    directoryLists: makeDirectoryLists(state),
    isLoading: makeIsLoading(state)
  };
};

export default withReducer('Home', reducers)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(DirectoryLists))
);
