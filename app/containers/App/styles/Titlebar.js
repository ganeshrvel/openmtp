'use strict';

import { variables, mixins } from '../../../styles/js';

export const styles = themes => {
  return {
    root: {
      width: `100%`,
      height: 14,
      ...mixins().appDragEnable
    }
  };
};
