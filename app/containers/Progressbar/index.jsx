'use strict';

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles';
import { log } from '@Log';
import { remote, ipcRenderer } from 'electron';
import { Helmet } from 'react-helmet';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';

class Progressbar extends Component {
  constructor(props) {
    super(props);

    this.initialState = {
      progressTitlebar: `Progress...`,
      progressTitle: `Progress...`,
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
    const { progressTitlebar, progressTitle, value, variant } = this.state;
    return (
      <div className={styles.root}>
        <Helmet titleTemplate={progressTitlebar}>
          <title>{progressTitlebar}</title>
        </Helmet>
        <Typography variant="subheading" className={styles.subheading}>
          {progressTitle}
        </Typography>
        <LinearProgress color="secondary" variant={variant} value={value} />
      </div>
    );
  }
}

export default withStyles(styles)(Progressbar);
