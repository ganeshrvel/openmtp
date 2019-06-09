import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { styles } from '../styles/Notification';
import { isString } from '../../../utils/funcs';

class Notification extends PureComponent {
  _handleBtnClick = ({ confirm = false }) => {
    const { onClickHandler } = this.props;
    onClickHandler(confirm);
  };

  _handleKeyPress = event => {
    if (event.key === 'Enter') {
      this._handleBtnClick({ confirm: true });
    }
  };

  render() {
    const {
      classes: styles,
      titleText = `Message`,
      bodyText,
      trigger,
      fullWidthDialog,
      maxWidthDialog
    } = this.props;
    return (
      <Dialog
        onKeyPress={this._handleKeyPress}
        open={trigger}
        fullWidth={fullWidthDialog}
        maxWidth={maxWidthDialog}
        aria-labelledby="notification-dialogbox"
        disableEscapeKeyDown={false}
        onEscapeKeyDown={() => this._handleBtnClick({ confirm: false })}
      >
        <DialogTitle>{titleText}</DialogTitle>
        <DialogContent>
          {isString(bodyText) ? (
            <DialogContentText>{bodyText}</DialogContentText>
          ) : (
            bodyText
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => this._handleBtnClick({ confirm: false })}
            color="primary"
            className={classNames(styles.btnPositive)}
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(Notification);
