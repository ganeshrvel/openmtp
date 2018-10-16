import React from 'react';
import { styles } from '../styles/ProgressBar';
import { withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

class ProgressBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      textFieldValue: null
    };
  }

  handleClick = ({ confirm = false }, e) => {
    const { textFieldValue } = this.state;
    const { onClickHandler } = this.props;

    e.preventDefault();
    onClickHandler({ confirm, textFieldValue });
  };

  handleChange = event => {
    this.setState({
      textFieldValue: event.target.value
    });
  };

  render() {
    const {
      classes: styles,
      bodyText,
      trigger,
      titleText,
      fullWidthDialog,
      maxWidthDialog,
      progressValue
    } = this.props;

    return (
      <Dialog
        className={styles.root}
        open={trigger}
        fullWidth={fullWidthDialog}
        maxWidth={maxWidthDialog}
      >
        <DialogTitle>{titleText}</DialogTitle>

        <DialogContent>
          <DialogContentText className={styles.dialogContentText}>
            {bodyText}
          </DialogContentText>

          <LinearProgress
            color="secondary"
            variant="determinate"
            value={progressValue}
          />
        </DialogContent>
      </Dialog>
    );
  }
}

export default withStyles(styles)(ProgressBar);
