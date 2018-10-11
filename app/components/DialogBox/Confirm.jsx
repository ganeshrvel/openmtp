import React from 'react';
import { styles } from './styles';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

class Confirm extends React.Component {
  constructor(props) {
    super(props);
  }

  handleClick = ({ confirm = false }) => {
    const { onClickHandler } = this.props;
    onClickHandler(confirm);
  };

  render() {
    const { bodyText, trigger } = this.props;
    return (
      <div>
        <Dialog
          open={trigger}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title">
            Confirm Action!
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              {bodyText}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={e => this.handleClick({ confirm: true })}
              color="secondary"
            >
              Yes
            </Button>
            <Button
              onClick={e => this.handleClick({ confirm: false })}
              color="secondary"
            >
              No
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withStyles(styles)(Confirm);
