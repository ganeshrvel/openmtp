'use strict';

import { variables, mixins } from '../../../styles/js';

export const styles = args => {
  return {
    root: {
      width: `100%`,
      height: 10,
      ...mixins().appDrag
    }
  };
};
