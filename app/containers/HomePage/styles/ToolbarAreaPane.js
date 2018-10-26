'use strict';

import { base } from '../../../styles/js';
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
    lazyLoaderOverLay: {
      position: `absolute`,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: `#ffffff`,
      zIndex: 9999
    },
    appBar: {},
    navBtns: {
      paddingLeft: 5
    },
    navBtnImgs: {
      height: 25,
      width: `auto`
    },
    disabledNavBtns: {
      backgroundColor: `#f9f9f9`
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
