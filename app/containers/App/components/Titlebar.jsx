'use strict';

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/Titlebar';

class Titlebar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes: styles } = this.props;
    return <div className={styles.root} />;
  }
}

export default withStyles(styles)(Titlebar);
