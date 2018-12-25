'use strict';

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/Titlebar';
import { toggleWindowSizeOnDoubleClick } from '../../../utils/titlebarDoubleClick';

class Titlebar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes: styles } = this.props;
    return (
      <div
        onDoubleClick={events => {
          toggleWindowSizeOnDoubleClick();
        }}
        className={styles.root}
      />
    );
  }
}

export default withStyles(styles)(Titlebar);
