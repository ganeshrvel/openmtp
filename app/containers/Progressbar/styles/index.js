'use strict';

import { variables, mixins } from '../../../styles/js';

export const styles = theme => ({
  root: {
    textAlign: `left`,
    ...mixins().center,
    width: 500,
    marginTop: 30
  },
  subheading: {
    marginBottom: 10
  }
});
