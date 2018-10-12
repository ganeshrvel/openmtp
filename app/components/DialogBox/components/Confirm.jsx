import React from 'react';
import { styles } from '../styles/index';
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
          aria-labelledby="confirm-dialogbox"
        >
          <DialogTitle>
            Confirm Action!
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
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
