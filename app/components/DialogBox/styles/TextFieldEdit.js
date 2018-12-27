'use strict';

import { variables, mixins } from '../../../styles/js';

export const styles = theme => ({
  root: {},
  dialogContentText: {
    marginBottom: 10,
    wordBreak: `break-all`
  },
  btnPositive: {
    ...mixins().btnPositive
  },
  btnNegative: {
    ...mixins().btnNegative
  }
});
