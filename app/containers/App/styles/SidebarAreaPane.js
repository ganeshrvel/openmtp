'use strict';

import { base } from '../../../styles/js';
const { variables } = base();

export const styles = theme => {
  return {
    root: {
      height: `100vh`,
      overflow: `auto`,
      maxWidth: variables.sizes.sidebarAreaPaneMaxWidth,
      minWidth: variables.sizes.sidebarAreaPaneMinWidth,
      float: `left`,
      background: `#f5f5f5`,
      paddingTop: 56
    },
    sidebarAreaListsCaption: {
      marginLeft: 10
    }
  };
};
