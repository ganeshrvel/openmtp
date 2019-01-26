import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import { styles } from '../styles/TextFieldEdit';

class TextFieldEdit extends PureComponent {
  constructor(props) {
    super(props);

    this.textFieldValue = null;
  }

  handleClick = ({ confirm = false }, event) => {
    const { onClickHandler } = this.props;
    event.preventDefault();

    onClickHandler({ confirm, textFieldValue: this.textFieldValue });
  };

  handleChange = event => {
    this.textFieldValue = event.target.value;
  };

  render() {
    const {
      classes: styles,
      bodyText,
      secondaryText,
      trigger,
      titleText,
      defaultValue,
      label,
      multiline,
      fullWidthDialog,
      maxWidthDialog,
      fullWidthTextField,
      autoFocus,
      required,
      id,
      btnPositiveText,
      btnNegativeText,
      errors
    } = this.props;

    return (
      <Dialog
        className={styles.root}
        open={trigger}
        fullWidth={fullWidthDialog}
        maxWidth={maxWidthDialog}
        disableEscapeKeyDown={false}
        onEscapeKeyDown={event => this.handleClick({ confirm: false }, event)}
      >
        <DialogTitle>{titleText}</DialogTitle>
        <form
          onSubmit={event => this.handleClick({ confirm: true }, event)}
          noValidate
          autoComplete="off"
        >
          <DialogContent>
            <DialogContentText className={styles.dialogContentText}>
              {bodyText}
              <Typography variant="caption">
                {typeof secondaryText !== 'undefined' && secondaryText !== null
                  ? secondaryText
                  : ''}
              </Typography>
            </DialogContentText>
            <TextField
              id={id}
              required={required}
              label={errors.toggle ? errors.message : label}
              fullWidth={fullWidthTextField}
              autoFocus={autoFocus}
              autoComplete="off"
              defaultValue={defaultValue}
              multiline={multiline}
              onFocus={event => this.handleChange(event)}
              onBlur={event => this.handleChange(event)}
              onChange={event => this.handleChange(event)}
              error={errors.toggle}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={event => this.handleClick({ confirm: false }, event)}
              color="secondary"
              className={classNames(styles.btnNegative)}
            >
              {btnNegativeText}
            </Button>
            <Button
              onClick={event => this.handleClick({ confirm: true }, event)}
              color="primary"
              className={classNames(styles.btnPositive)}
            >
              {btnPositiveText}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
}

export default withStyles(styles)(TextFieldEdit);
