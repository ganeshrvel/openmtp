import React, { PureComponent } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import { withStyles } from '@material-ui/core/styles';
import SnackbarThemeWrapper from './components/SnackbarThemeWrapper';
import { styles } from './styles';

class Snackbars extends PureComponent {
  constructor(props) {
    super(props);
    this.snackbarOpen = false;
  }

  componentWillMount() {
    this.fireSnackbar();
  }

  fireSnackbar = () => {
    this.snackbarOpen = true;
  };

  handleClose = (event, reason) => {
    const { OnSnackBarsCloseAlerts } = this.props;
    if (reason === 'clickaway') {
      return;
    }

    this.snackbarOpen = false;
    OnSnackBarsCloseAlerts();
  };

  render() {
    const { classes: styles, message, variant, autoHideDuration } = this.props;

    return (
      <Snackbar
        className={styles.root}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={this.snackbarOpen}
        autoHideDuration={autoHideDuration}
        onClose={this.handleClose}
      >
        <SnackbarThemeWrapper
          onClose={this.handleClose}
          variant={variant}
          message={message}
        />
      </Snackbar>
    );
  }
}

export default withStyles(styles)(Snackbars);
