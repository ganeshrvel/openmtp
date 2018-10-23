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
  }

  render() {
    const {
      classes: styles,
      bodyText1,
      bodyText2,
      trigger,
      titleText,
      fullWidthDialog,
      maxWidthDialog,
      progressValue,
      variant
    } = this.props;
    
    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        className={styles.root}
        open={trigger}
        fullWidth={fullWidthDialog}
        maxWidth={maxWidthDialog}
        aria-labelledby="progressbar-dialogbox"
      >
        <DialogTitle>{titleText}</DialogTitle>

        <DialogContent>
          <DialogContentText className={styles.dialogContentText}>
            {bodyText1}
          </DialogContentText>

          <LinearProgress
            color="secondary"
            variant={variant}
            value={progressValue}
          />
          
          <DialogContentText className={styles.dialogContentText}>
            {bodyText2}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    );
  }
}

export default withStyles(styles)(ProgressBar);
