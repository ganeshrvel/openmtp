'use strict';

import React, { PureComponent } from 'react';
import { styles } from '../styles/SidebarAreaPaneLists';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import FolderIcon from '@material-ui/icons/Folder';

class SidebarAreaPaneLists extends PureComponent {
  constructor(props) {
    super(props);
  }

  _fetchDirList({ ...args }) {
    const { onClickHandler } = this.props;
    onClickHandler({ ...args });
  }

  render() {
    const { classes: styles, sidebarFavouriteList } = this.props;
    const { top: sidebarTop, bottom: sidebarBottom } = sidebarFavouriteList;

    return (
      <div className={styles.listsWrapper}>
        <Typography variant="caption" className={styles.listsCaption}>
          Favourites
        </Typography>
        {sidebarTop.length > 1 && this.ListsRender(sidebarTop)}

        {sidebarBottom.length > 1 && (
          <React.Fragment>
            <Divider />
            {this.ListsRender(sidebarBottom)}
          </React.Fragment>
        )}
      </div>
    );
  }

  ListsRender = listData => {
    const { classes: styles, deviceType, currentBrowsePath } = this.props;
    return (
      <List component="nav" dense={true} className={styles.listsBottom}>
        {listData.map((item, index) => {
          return (
            <ListItem
              key={index}
              button
              selected={currentBrowsePath === item.path}
              disabled={!item.enabled}
              onClick={e =>
                this._fetchDirList({
                  filePath: item.path,
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
    );
  };
}

export default withStyles(styles)(SidebarAreaPaneLists);
