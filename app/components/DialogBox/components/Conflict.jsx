import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { styles } from '../styles/Conflict';
import { niceBytes } from '../../../utils/funcs';
import { appDateFormat } from '../../../utils/date';

class Conflict extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      applyToAll: false,
    };
  }

  _handleAction = (action) => {
    const { onAction } = this.props;
    const { applyToAll } = this.state;

    this.setState({ applyToAll: false });
    onAction({ action, applyToAll });
  };

  _handleApplyToAllChange = (event) => {
    this.setState({ applyToAll: event.target.checked });
  };

  render() {
    const {
      classes: styles,
      trigger,
      conflictType,
      fileName,
      sourceSize,
      destSize,
      sourceDate,
      destDate,
    } = this.props;
    const { applyToAll } = this.state;

    const isDirectory = conflictType === 'directory';
    const sizesMatch = sourceSize === destSize;
    const titleText = isDirectory
      ? 'Folder Already Exists'
      : 'File Already Exists';

    const applyToAllLabel = isDirectory
      ? 'Apply to all folders'
      : sizesMatch
      ? 'Apply to all files with same size'
      : 'Apply to all files with different sizes';

    return (
      <Dialog
        open={trigger}
        fullWidth
        maxWidth="xs"
        aria-labelledby="conflict-dialogbox"
        disableEscapeKeyDown
      >
        <DialogTitle>{titleText}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            &quot;{fileName}&quot; already exists at the destination.
          </DialogContentText>

          {!isDirectory && (
            <>
              <div className={styles.metadataRow}>
                <span className={styles.metadataLabel}>Source:</span>
                <span className={styles.metadataValue}>
                  {niceBytes(sourceSize)} &middot; {appDateFormat(sourceDate)}
                </span>
              </div>
              <div className={styles.metadataRow}>
                <span className={styles.metadataLabel}>Destination:</span>
                <span className={styles.metadataValue}>
                  {niceBytes(destSize)} &middot; {appDateFormat(destDate)}
                </span>
              </div>
              <div className={styles.sizeIndicator}>
                <span>
                  Sizes: {sizesMatch ? '\u2713 Same' : '\u26A0 Different'}
                </span>
              </div>
            </>
          )}

          <div className={styles.applyToAllWrapper}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={applyToAll}
                  onChange={this._handleApplyToAllChange}
                  color="primary"
                  size="small"
                />
              }
              label={applyToAllLabel}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => this._handleAction('skip')}
            color="secondary"
            className={classNames(styles.btnNegative)}
          >
            Skip
          </Button>
          <Button
            onClick={() =>
              this._handleAction(isDirectory ? 'merge' : 'replace')
            }
            color="primary"
            className={classNames(styles.btnPositive)}
          >
            {isDirectory ? 'Merge' : 'Replace'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(Conflict);
