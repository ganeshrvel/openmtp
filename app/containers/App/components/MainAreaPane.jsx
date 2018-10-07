'use strict';

import React, { Component } from 'react';
import { styles } from '../styles/MainAreaPane.js';
import ContentAreaPane from './ContentAreaPane';
import { withStyles } from '@material-ui/core/styles';

class MainAreaPane extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes: styles } = this.props;
    return (
      <div className={styles.root}>
        <ContentAreaPane />
      </div>
    );
  }
}

export default withStyles(styles)(MainAreaPane);
