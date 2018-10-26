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
    ...variables.mixins.noselect,
    marginTop: 15
  },
  instructions: {
    color: variables.styles.textLightColor,
    textAlign: 'left',
    lineHeight: '24px',
    marginTop: 4,
    marginBottom: 10
  },
  generateLogsBtn: {
    marginTop: 0
  },
  emailIdWrapper: {
    color: variables.styles.textLightColor,
    marginTop: 15
  },
  emailId: {
    color: variables.styles.secondaryColor.main
  }
});
