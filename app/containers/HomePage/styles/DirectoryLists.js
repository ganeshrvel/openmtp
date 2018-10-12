'use strict';

import { base } from '../../../styles/js';
const { variables } = base();

export const styles = theme => ({
  root: {
    width: '100%',
    ...variables.mixins.noselect
  },
  table: {
    //minWidth: 1020
  },
  tableWrapper: {
    height: `calc(100vh - 116px)`,
    overflowY: 'auto',
    overflowX: 'auto',
    borderBottom: variables.styles.borderThinDividerColor,
    borderLeft: variables.styles.borderThinDividerColor
  },
  emptyTableRowWrapper: {
    //height: `calc(100vh - 175px)`
  },
  tableRowSelected: {
    backgroundColor: 'rgba(41, 121, 255, 0.15) !important'
  },
  tableCellIcon: {
    verticalAlign: `middle`
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
  tableFooter: {}
});
