'use strict';

import { base } from '../../../styles/js';
const { variables } = base();

export const styles = args => {
  return {
    root: {
      width: `100%`,
      height: 14,
      [`-webkitUserSelect`]: `none`,
      [`-webkitAppRegion`]: `drag`
    }
  };
};
