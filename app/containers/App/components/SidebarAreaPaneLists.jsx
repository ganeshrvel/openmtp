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
//import {} from '../actions';
import { makeSidebarFavouriteList } from '../selectors';

class SidebarAreaPaneLists extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes: styles } = this.props;
    const {
      top: sidebarTop,
      bottom: sidebarBottom
    } = this.props.sidebarFavouriteList;
    return (
      <React.Fragment>
        {sidebarTop.length > 1 && (
          <List component="nav" dense={true}>
            {sidebarTop.map((item, index) => {
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

        {sidebarBottom.length > 1 && (
          <React.Fragment>
            <Divider />
            <List component="nav" dense={true}>
              {sidebarBottom.map((item, index) => {
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

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      handleClick: (key, event) => (_, getState) => {}
    },
    dispatch
  );

const mapStateToProps = (state, props) => {
  return {
    sidebarFavouriteList: makeSidebarFavouriteList(state)
  };
};

export default withReducer('App', reducers)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(SidebarAreaPaneLists))
);
