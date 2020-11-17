import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { styles } from '../styles/Confirm';

class Confirm extends PureComponent {
  _handleBtnClick = ({ confirm = false }) => {
    const { onClickHandler } = this.props;

    onClickHandler(confirm);
  };

  _handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      this._handleBtnClick({ confirm: true });
    }
  };

  render() {
    const {
      classes: styles,
      titleText = `Confirm Action`,
      bodyText,
      trigger,
      fullWidthDialog,
      maxWidthDialog,
    } = this.props;

    return (
      <Dialog
        onKeyPress={this._handleKeyPress}
        open={trigger}
        fullWidth={fullWidthDialog}
        maxWidth={maxWidthDialog}
        aria-labelledby="confirm-dialogbox"
        disableEscapeKeyDown={false}
        onEscapeKeyDown={() => this._handleBtnClick({ confirm: false })}
      >
        <DialogTitle>{titleText}</DialogTitle>
        <DialogContent>
          <DialogContentText>{bodyText}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => this._handleBtnClick({ confirm: false })}
            color="secondary"
            className={classNames(styles.btnNegative)}
          >
            No
          </Button>
          <Button
            onClick={() => this._handleBtnClick({ confirm: true })}
            color="primary"
            className={classNames(styles.btnPositive)}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(Confirm);
