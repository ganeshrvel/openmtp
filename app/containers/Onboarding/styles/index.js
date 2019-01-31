'use strict';

import { variables, mixins } from '../../../styles/js';

export const styles = theme => ({
  root: {},
  btnPositive: {
    ...mixins().btnPositive
  },
  divider: {
    marginBottom: 20
  }
});
