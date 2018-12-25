'use strict';

import { variables, mixins } from '../../../styles/js';

export const styles = theme => ({
  subHeading: {
    ...mixins().noDrag,
    ...mixins().noselect,
    marginTop: 15
  },
  instructions: {
    listStyle: `none`,
    color: variables().styles.textLightColor,
    lineHeight: '24px',
    marginTop: 15,
    paddingLeft: 0,
    marginBottom: 15
  },
  generateLogsBtn: {
    marginTop: 0
  },
  emailIdWrapper: {
    color: variables().styles.textLightColor,
    marginTop: 15
  },
  emailId: {
    fontWeight: `bold`
  }
});
