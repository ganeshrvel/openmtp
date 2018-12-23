'use strict';

import { variables, mixins } from '../../../styles/js';

export const styles = theme => ({
  root: {
    textAlign: `center`,
    ...mixins().center,
    width: 500,
    marginTop: 77
  }
});
