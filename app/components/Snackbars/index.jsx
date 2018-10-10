import React from 'react';
import { styles } from './styles';
import Snackbar from '@material-ui/core/Snackbar';
import { withStyles } from '@material-ui/core/styles';
import SnackbarThemeWrapper from './components/SnackbarThemeWrapper';

class Snackbars extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  fireSnackbar = () => {
    this.setState({ open: true });
  };

  handleClose = (event, reason) => {
    const { OnSnackBarsCloseAlerts } = this.props;
    if (reason === 'clickaway') {
      return;
    }
    this.setState({ open: false });
    OnSnackBarsCloseAlerts();
  };

  componentWillMount() {
    this.fireSnackbar();
  }

  render() {
    const {
      classes: styles,
      message,
      variant,
      autoHideDuration
    } = this.props;

    return (
      <Snackbar
        className={styles.root}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={this.state.open}
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
