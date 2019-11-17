'use strict';

import { variables, mixins } from '../../../styles/js';

export const styles = theme => ({
  root: {
    width: '100%',
    ...mixins().noselect
  },
  tableWrapper: {
    ...mixins().noOutline,
    height: `calc(100vh - 120px)`,
    overflowY: 'auto',
    overflowX: 'auto',
    borderBottom: variables().styles.borderThinDividerColor,
    borderLeft: variables().styles.borderThinDividerColor,
    [`&.onHoverDropZone`]: {
      backgroundColor: `#e0e0e0`
    },
    [`&.statusBarActive`]: {
      height: `calc(100vh - 150px) !important`
    }
  }
});
