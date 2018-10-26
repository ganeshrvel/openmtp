'use strict';

import { variables, mixins } from '../../../styles/js';

export const styles = theme => ({
  root: {
    textAlign: `center`,
    ...mixins().center,
    ...mixins().absoluteCenter
  },
  bugImg: {
    ...mixins().noDrag,
    height: `auto`,
    width: 150
  },
  headings: {
    ...mixins().noDrag,
    ...mixins().noselect,
    marginTop: 15
  },
  subHeading: {
    ...mixins().noDrag,
    ...mixins().noselect,
    marginTop: 15
  },
  goBackBtn: {
    marginTop: 20
  }
});
