'use strict';

import { base } from '../../../styles/js';
const { variables } = base();

export const styles = theme => {
  return {
    listsWrapper: {
      paddingTop: variables.sizes.sidebarAreaPaddingTop,
      width: variables.sizes.sidebarAreaPaneWidth
    },
    listsBottom: {
      paddingTop: 20
    },
    listsCaption: {
      padding: `0 0 5px 20px`
    },
    primary: {},
    icon: {}
  };
};
