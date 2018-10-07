'use strict';

import React, { Component } from 'react';
import { styles } from '../styles/ContentAreaPane.js';
import { withStyles } from '@material-ui/core/styles';
import Routes from '../../../routing';

class ContentAreaPane extends Component {
  render() {
    const { classes: styles } = this.props;
    return (
      <div className={styles.root}>
        <Routes />
      </div>
    );
  }
}

export default withStyles(styles)(ContentAreaPane);
