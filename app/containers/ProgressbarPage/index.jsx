'use strict';

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles';
import { log } from '@Log';
import { ipcRenderer } from 'electron';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';

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
    ipcRenderer.on('progressbarCommunicate', (event, { ...args }) => {
      this.setState({ ...args });
    });
  }

  render() {
    const { classes: styles } = this.props;
    const { progressTitle, progressBodyText, value, variant } = this.state;
    return (
      <div className={styles.root}>
        <Typography variant="subheading" className={styles.subheading}>
          {progressTitle}
        </Typography>
        <Typography variant="body1" className={styles.subheading}>
          {progressBodyText}
        </Typography>
        <LinearProgress color="secondary" variant={variant} value={value} />
      </div>
    );
  }
}

export default withStyles(styles)(ProgressbarPage);
