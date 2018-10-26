'use strict';

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/Titlebar';
import { remote } from 'electron';

class Titlebar extends React.Component {
  constructor(props) {
    super(props);
  }

  handleDoubleClick = () => {
    this.toggleWindowSize();
  };

  toggleWindowSize = () => {
    const window = remote.getCurrentWindow();
    if (!window.isMaximized()) {
      window.maximize();
      return null;
    }
    window.unmaximize();
  };

  render() {
    const { classes: styles } = this.props;
    return (
      <div onDoubleClick={this.handleDoubleClick} className={styles.root} />
    );
  }
}

export default withStyles(styles)(Titlebar);
