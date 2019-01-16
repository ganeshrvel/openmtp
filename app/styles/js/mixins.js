'use strict';

import { variables } from './index';

// eslint-disable-next-line no-unused-vars
export default args => {
  return {
    noselect: {
      [`-webkitTouchCallout`]: `none`,
      [`-webkitUserSelect`]: `none`,
      [`-khtmlUserSelect`]: `none`,
      [`-mozUserSelect`]: `none`,
      [`-msUserSelect`]: `none`,
      [`userSelect`]: `none`
    },
    noDrag: {
      WebkitUserDrag: 'none',
      KhtmlUserDrag: 'none',
      MozUserDrag: 'none',
      OUserDrag: 'none',
      userDrag: 'none'
    },
    absoluteCenter: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      WebkitTransform: 'translate(-50%, -50%)',
      transform: 'translate(-50%, -50%)'
    },
    center: {
      marginLeft: `auto`,
      marginRight: `auto`
    },
    get appDragEnable() {
      return {
        [`-webkitAppRegion`]: `drag`,
        ...this.noselect
      };
    },
    appDragDisable: {
      [`-webkitAppRegion`]: `no-drag`
    },
    a: {
      cursor: `pointer`,
      color: variables().styles.secondaryColor.main
    },
    btnPositive: {
      backgroundColor: variables().styles.secondaryColor.main,
      borderColor: variables().styles.secondaryColor.main,
      '&:hover': {
        backgroundColor: '#0069d9',
        borderColor: '#0062cc'
      },
      '&:active': {
        boxShadow: 'none',
        backgroundColor: '#0062cc',
        borderColor: '#005cbf'
      },
      '&:focus': {
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,0.5)'
      }
    },
    btnNegative: {
      backgroundColor: `rgba(0, 122, 245, 0.08)`,
      borderColor: `rgba(0, 122, 245, 0.08)`,
      '&:hover': {
        backgroundColor: `rgba(0, 122, 245, 0.15)`,
        borderColor: '#0062cc'
      },
      '&:active': {
        boxShadow: 'none',
        backgroundColor: `rgba(0, 122, 245, 0.23)`,
        borderColor: '#005cbf'
      },
      '&:focus': {
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,0.5)'
      }
    }
  };
};
