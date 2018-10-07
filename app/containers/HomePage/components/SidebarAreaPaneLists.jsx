'use strict';

import React, { Component } from 'react';
import { styles } from '../styles/SidebarAreaPaneLists';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import FolderIcon from '@material-ui/icons/Folder';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withReducer } from '../../../store/reducers/withReducer';
import reducers from '../reducers';
import {} from '../actions';

class SidebarAreaPaneLists extends Component {
  constructor(props) {
    super(props);
    this.sidebarBottom = this.props.sidebarFavouriteList.bottom;
    this.sidebarTop = this.props.sidebarFavouriteList.top;
  }

  render() {
    const { classes: styles } = this.props;

    return (
      <React.Fragment>
        {this.sidebarTop.length > 1 && (
          <List component="nav" dense={true}>
            {this.sidebarTop.map((item, index) => {
              return (
                <ListItem
                  key={index}
                  button
                  selected={item.selected}
                  disabled={!item.enabled}
                >
                  <ListItemIcon>
                    {item.icon === 'folder' && <FolderIcon />}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItem>
              );
            })}
          </List>
        )}

        {this.sidebarBottom.length > 1 && (
          <React.Fragment>
            <Divider />
            <List component="nav" dense={true}>
              {this.sidebarBottom.map((item, index) => {
                return (
                  <ListItem
                    key={index}
                    button
                    selected={item.selected}
                    disabled={!item.enabled}
                  >
                    <ListItemIcon>
                      {item.icon === 'folder' && <FolderIcon />}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItem>
                );
              })}
            </List>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(SidebarAreaPaneLists);
