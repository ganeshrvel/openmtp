'use strict';

import { variables, mixins } from '../../../styles/js';

export const styles = theme => ({
  root: {
    textAlign: `left`,
    ...mixins().center,
    width: 500,
    marginTop: 10
  },
  subheading: {
    marginBottom: 10
  }
});
