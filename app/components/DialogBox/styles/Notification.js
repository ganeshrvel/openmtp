

import { variables, mixins } from '../../../styles/js';

export const styles = theme => ({
  margin: {},
  root: {},
  btnPositive: {
    ...mixins().btnPositive
  },
  btnNegative: {
    ...mixins().btnNegative
  }
});
