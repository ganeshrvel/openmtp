import React from 'react';
import { styles } from './styles';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

function LoadingIndicator(props) {
  const { classes: styles } = props;
  return (
    <div>
      <CircularProgress className={styles.progress} size={50} />
    </div>
  );
}

export default withStyles(styles)(LoadingIndicator);
