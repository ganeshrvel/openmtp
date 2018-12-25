'use strict';

import { variables } from './index';

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
    appDrag: {
      [`-webkitUserSelect`]: `none`,
      [`-webkitAppRegion`]: `drag`
    },
    a: {
      cursor: `pointer`,
      color: variables().styles.secondaryColor.main
    }
  };
};
