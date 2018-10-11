'use strict';

import React, { Component } from 'react';
import { styles } from '../styles/ContextMenu';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { withStyles } from '@material-ui/core/styles';

class ContextMenu extends React.Component {
  constructor(props) {
    super(props);
    this.contextMenuRef = React.createRef();
  }

  componentWillMount() {
    const { deviceType } = this.props;
  }

  componentDidMount() {}

  render() {
    const { classes: styles, trigger, contextMenuPos } = this.props;

    return trigger ? (
      <div
        className={styles.root}
        style={contextMenuPos}
        ref={this.contextMenuRef}
      >
        <List dense={true} component="nav">
          <ListItem button>
            <ListItemText primary="Rename" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Copy" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Move" />
          </ListItem>
        </List>
      </div>
    ) : (
      <React.Fragment />
    );
  }
}

export default withStyles(styles)(ContextMenu);
