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
    const {
      classes: styles,
      trigger,
      contextMenuPos,
      contextMenuList,
      deviceType
    } = this.props;
    console.log(contextMenuList);
    return trigger ? (
      <div
        className={styles.root}
        style={contextMenuPos}
        ref={this.contextMenuRef}
      >
        <List dense={true}>
          {Object.keys(contextMenuList).map(a => {
            const item = contextMenuList[a];

            return (
              <ListItem
                key={a}
                button
                disabled={!item.enabled}
                onClick={
                  e => {}
                  /*this._fetchDirList({
                    path: item.path,
                    deviceType: deviceType,
                    isSidemenu: true
                  })*/
                }
              >
                <ListItemText primary={item.label} />
              </ListItem>
            );
          })}
        </List>
      </div>
    ) : (
      <React.Fragment />
    );
  }
}

export default withStyles(styles)(ContextMenu);
