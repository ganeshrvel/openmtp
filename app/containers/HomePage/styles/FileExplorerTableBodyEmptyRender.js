'use strict';

import { variables, mixins } from '../../../styles/js';
import { tableCellFileExplorerTableRowsRender } from './FileExplorerTableBodyListRender';

export const styles = theme => ({
  emptyTableRowWrapper: {},
  tableCell: tableCellFileExplorerTableRowsRender,
  noMtp: {
    marginTop: 10
  },
  instructions: {
    marginTop: 5,
    lineHeight: `18px`,
    paddingLeft: 30,
    color: `rgba(0, 0, 0, 0.8)`
  }
});
