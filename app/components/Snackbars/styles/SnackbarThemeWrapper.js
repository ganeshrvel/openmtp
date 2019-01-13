'use strict';

import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';
import { variables, mixins } from '../../../styles/js';

export const styles = theme => ({
  success: {
    backgroundColor: green[600]
  },
  error: {
    backgroundColor: theme.palette.error.dark
  },
  info: {
    backgroundColor: theme.palette.primary.dark
  },
  warning: {
    backgroundColor: amber[700]
  },
  icon: {
    fontSize: 20
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing.unit
  },
  message: {
    display: 'flex',
    alignItems: 'center'
  },
  root: {
    minWidth: 288,
    maxWidth: 568,
    borderRadius: 4,
    flexGrow: `unset`
  }
});
