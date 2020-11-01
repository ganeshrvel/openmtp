'use strict';

import { variables, mixins } from '../../../styles/js';

export const styles = (theme) => {
  return {
    root: {},
    grid: {
      width: `100%`,
    },
    splitPane: {
      width: `50%`,
      float: `left`,
      [`&:after`]: {
        content: '""',
        display: `table`,
        clear: `both`,
      },
    },
  };
};
