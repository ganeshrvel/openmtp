'use strict';

import { base } from '../../../styles/js';
const { variables } = base();

export const styles = theme => ({
  subHeading: {
    ...variables.mixins.noDrag,
    ...variables.mixins.noselect,
    marginTop: 15
  },
  instructions: {
    listStyle: `none`,
    color: variables.styles.textLightColor,
    lineHeight: '24px',
    marginTop: 15,
    paddingLeft: 0,
    marginBottom: 15
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
  },
  goBackBtn: {
    marginTop: 30
  }
});
