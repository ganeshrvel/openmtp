'use strict';

import React from 'react';
import classNames from 'classnames';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import WarningIcon from '@material-ui/icons/Warning';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/SnackbarThemeWrapper';

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon
};

const SnackbarThemeWrapper = props => {
  const { classes: styles, message, onClose, variant, ...other } = props;
  const Icon = variantIcon[variant];

  return (
    <SnackbarContent
      className={classNames(styles[variant], styles.root)}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" className={styles.message}>
          <Icon className={classNames(styles.icon, styles.iconVariant)} />
          {message}
        </span>
      }
      action={[
        <IconButton
          key="close"
          aria-label="Close"
          color="inherit"
          className={styles.close}
          onClick={onClose}
        >
          <CloseIcon className={styles.icon} />
        </IconButton>
      ]}
      {...other}
    />
  );
};

export default withStyles(styles)(SnackbarThemeWrapper);
