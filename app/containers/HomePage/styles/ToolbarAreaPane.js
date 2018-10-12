'use strict';

import { base } from '../../../styles/js/index';
const { variables } = base();

export const styles = theme => {
  return {
    root: {},
    grow: {
      flexGrow: 1
    },
    toolbarInnerWrapper: {
      display: 'flex'
    },
    toolbar: {
      width: `auto`,
      height: variables.sizes.toolbarHeight
    },
    appBar: {},
    navBtns: {
      height: 25,
      width: `auto`
    },
    invertedNavBtns: {
      [`&:hover`]: {
        filter: `none`
      },
      [`&:not(:hover)`]: {
        filter: `invert(100)`,
        background: variables.styles.primaryColor.main
      }
    }
  };
};
