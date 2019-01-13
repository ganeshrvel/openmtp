import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import { styles } from './styles';

function LoadingIndicator(props) {
  const { classes: styles } = props;
  return (
    <div>
      <CircularProgress
        color="secondary"
        className={styles.progress}
        size={50}
      />
    </div>
  );
}

export default withStyles(styles)(LoadingIndicator);
