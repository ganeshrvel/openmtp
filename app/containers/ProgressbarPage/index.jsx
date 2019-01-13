'use strict';

import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import { styles } from './styles';

class ProgressbarPage extends Component {
  constructor(props) {
    super(props);

    this.initialState = {
      progressTitle: `Progress...`,
      progressBodyText: `Progress...`,
      value: 0,
      variant: `indeterminate`
    };

    this.state = {
      ...this.initialState
    };
  }

  componentWillMount() {
    ipcRenderer.on('progressBarDataCommunication', (event, { ...args }) => {
      this.setState({ ...args });
    });
  }

  render() {
    const { classes: styles } = this.props;
    const { progressTitle, progressBodyText, value, variant } = this.state;
    return (
      <div className={styles.root}>
        <Typography variant="body1" className={styles.progressTitle}>
          {progressTitle}
        </Typography>
        <Typography variant="body1" className={styles.progressBodyText}>
          {progressBodyText}
        </Typography>
        <LinearProgress color="secondary" variant={variant} value={value} />
      </div>
    );
  }
}

export default withStyles(styles)(ProgressbarPage);
