'use strict';

import { variables, mixins } from '../../../styles/js';

export const styles = args => {
  return {
    root: {
      width: `100%`,
      height: 14,
      ...mixins().appDrag
    }
  };
};
