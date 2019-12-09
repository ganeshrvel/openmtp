'use strict';

import { variables, mixins } from '../../../styles/js';

export const styles = theme => ({
  tableHeadCell: {
    border: `unset`,
    backgroundColor: variables().styles.tableHeaderFooterBgColor,
    position: 'sticky',
    top: 0,
    zIndex: 10
  }
});
