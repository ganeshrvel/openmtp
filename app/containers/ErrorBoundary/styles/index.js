'use strict';

import { base } from '../../../styles/js';
const { variables } = base();

export const styles = theme => ({
  root: {
    textAlign: `center`,
    ...variables.mixins.center,
    ...variables.mixins.absoluteCenter
  },
  bugImg: {
    ...variables.mixins.noDrag,
    height: `auto`,
    width: 150
  },
  headings: {
    ...variables.mixins.noDrag,
    ...variables.mixins.noselect,
    marginTop: 15
  },
  subHeading: {
    ...variables.mixins.noDrag,
    ...variables.mixins.noselect
  },
  sendErrorLogsBtn: {
    marginTop: 20
  }
});
