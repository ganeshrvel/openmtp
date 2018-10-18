'use strict';

import React, { Component } from 'react';
import { styles } from '../styles/DirectoryListsTableFooter';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

class DirectoryListsTableFooter extends React.Component {
  constructor(props) {
    super(props);
  }

  handleClickPath = (value, event) => {
    console.log(value);
  };

  render() {
    const { classes: styles } = this.props;

    return (
      <div className={styles.root}>
        <div className={styles.rootBreadcrumbs}>
          <Paper elevation={0}>
            <Typography
              className={styles.pathItem}
              variant="body1"
              onClick={event => {
                this.handleClickPath('a', event);
              }}
            >
              This is a sheet of paper.
            </Typography>
          </Paper>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(DirectoryListsTableFooter);
