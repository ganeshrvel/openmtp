'use strict';

import React, { Component } from 'react';
import { styles } from '../styles/SidebarAreaPane';
import { withStyles } from '@material-ui/core/styles';
import SidebarAreaPaneLists from './SidebarAreaPaneLists';
import Typography from '@material-ui/core/Typography';

class SidebarAreaPane extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes: styles } = this.props;
    return (
      <div className={styles.root}>
        <div>
          <Typography
            variant="caption"
            className={styles.sidebarAreaListsCaption}
          >
            Favourites
          </Typography>
          <SidebarAreaPaneLists />
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(SidebarAreaPane);
