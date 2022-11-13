import React from 'react';
import classNames from 'classnames';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import Button from '@material-ui/core/Button';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import WarningIcon from '@material-ui/icons/Warning';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/SnackbarThemeWrapper';

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
};

function SnackbarThemeWrapper(props) {
  const { classes: styles, message, onClose, variant, ...other } = props;
  const Icon = variantIcon[variant];

  return (
    <SnackbarContent
      onClick={onClose}
      className={classNames(styles[variant], styles.root)}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" className={styles.message}>
          <Icon className={classNames(styles.icon, styles.iconVariant)} />
          {message}
        </span>
      }
      action={[
        <Button
          key={1}
          onClick={onClose}
          color="primary"
          className={styles.closeBtn}
        >
          Close
        </Button>,
      ]}
      {...other}
    />
  );
}

export default withStyles(styles)(SnackbarThemeWrapper);
