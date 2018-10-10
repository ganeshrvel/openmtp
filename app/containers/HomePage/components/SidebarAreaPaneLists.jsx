'use strict';

import React, { Component } from 'react';
import { styles } from '../styles/SidebarAreaPaneLists';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import FolderIcon from '@material-ui/icons/Folder';

class SidebarAreaPaneLists extends Component {
  constructor(props) {
    super(props);
  }

  _fetchDirList({ ...args }) {
    const { onClickHandler } = this.props;
    onClickHandler({ ...args });
  }

  render() {
    const { classes: styles, sidebarFavouriteList, deviceType } = this.props;
    const { top: sidebarTop, bottom: sidebarBottom } = sidebarFavouriteList;

    return (
      <div className={styles.listsWrapper}>
        <Typography variant="caption" className={styles.listsCaption}>
          Favourites
        </Typography>
        {sidebarTop.length > 1 && (
          <List component="nav" dense={true}>
            {sidebarTop.map((item, index) => {
              return (
                <ListItem
                  key={index}
                  button
                  selected={item.selected}
                  disabled={!item.enabled}
                  onClick={e =>
                    this._fetchDirList({
                      path: item.path,
                      deviceType: deviceType,
                      isSidemenu: true
                    })
                  }
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
            <List component="nav" dense={true} className={styles.listsBottom}>
              {sidebarBottom.map((item, index) => {
                return (
                  <ListItem
                    key={index}
                    button
                    selected={item.selected}
                    disabled={!item.enabled}
                    onClick={e =>
                      this._fetchDirList({
                        path: item.path,
                        deviceType: deviceType,
                        isSidemenu: true
                      })
                    }
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
      </div>
    );
  }
}

export default withStyles(styles)(SidebarAreaPaneLists);
