'use strict';

import React, { Component } from 'react';
import classNames from 'classnames';
import { styles } from '../styles/ContextMenu';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { withStyles } from '@material-ui/core/styles';
import { deviceTypeConst } from '../../../constants';

class ContextMenu extends React.Component {
  constructor(props) {
    super(props);
    this.contextMenuRef = React.createRef();
  }

  componentWillMount() {
    const { deviceType } = this.props;
  }

  componentDidMount() {}

  _handleOnListClick({ ...args }) {
    const { onContextMenuListActions } = this.props;
    onContextMenuListActions({ ...args });
  }

  render() {
    const {
      classes: styles,
      trigger,
      contextMenuPos,
      contextMenuList,
      deviceType
    } = this.props;

    return trigger ? (
      <div
        className={classNames(styles.root, {
          [styles.heightDeviceLocal]: deviceType === deviceTypeConst.local,
          [styles.heightDeviceMtp]: deviceType === deviceTypeConst.mtp
        })}
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
                onClick={e => {
                  this._handleOnListClick({
                    [a]: {
                      ...item
                    }
                  });
                }}
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
