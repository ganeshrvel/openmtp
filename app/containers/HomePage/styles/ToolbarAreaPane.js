'use strict';

import styled, { keyframes } from 'styled-components';
import { variables, mixins } from '../../../styles/js';

export const styles = theme => {
  return {
    root: {
      ...mixins().appDrag
    },
    grow: {
      flexGrow: 1
    },
    toolbarInnerWrapper: {
      display: 'flex'
    },
    toolbar: {
      width: `auto`,
      height: variables().sizes.toolbarHeight
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
        background: variables().styles.primaryColor.main
      }
    }
  };
};

const animateLazyLoaderOverLay = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    left: -9999px;
    display: none;
  }
`;

export const LazyLoaderOverLay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ffffff;
  z-index: 9999;

  animation: ${animateLazyLoaderOverLay} 0s 5s forwards;
`;
