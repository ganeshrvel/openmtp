'use strict';

import { base } from '../../../styles/js';
const { variables } = base();

export const styles = theme => ({
  root: {
    width: '100%',
    ...variables.mixins.noselect,
  },
  table: {},
  tableWrapper: {
    height: `calc(100vh - 124px)`,
    overflowY: 'auto',
    overflowX: 'auto',
    borderBottom: variables.styles.borderThinDividerColor,
    borderLeft: variables.styles.borderThinDividerColor
  },
  emptyTableRowWrapper: {},
  tableRowSelected: {
    backgroundColor: 'rgba(41, 121, 255, 0.15) !important'
  },
  tableCellIcon: {
    verticalAlign: `middle`,
    [`&.isFolder`]: {
      color: `#1564b3`
    },
    [`&.isFile`]: {
      color: `#000000`
    }
  },
  tableCell: {
    borderBottom: `unset`,
    [`&.checkboxCell`]: {
      width: 50
    },
    [`&.nameCell`]: {
      whiteSpace: `nowrap`,
      overflow: `hidden`,
      textOverflow: `ellipsis`,
      width: `75%`,
      maxWidth: 410
    },
    [`&.sizeCell`]: {
      whiteSpace: `nowrap`,
      overflow: `hidden`,
      textOverflow: `ellipsis`,
      width: `auto`,
      minWidth: 100
    },
    [`&.dateAddedCell`]: {
      whiteSpace: `nowrap`,
      overflow: `hidden`,
      textOverflow: `ellipsis`,
      width: `auto`,
      minWidth: 100,
      paddingRight: 10
    }
  },
  tableFooter: {},
  noMtp: {
    marginTop: 10
  },
  instructions: {
    marginTop: '5px',
    lineHeight: '18px',
    paddingLeft: '30px',
    color: `rgba(0, 0, 0, 0.8)`
  }
});
