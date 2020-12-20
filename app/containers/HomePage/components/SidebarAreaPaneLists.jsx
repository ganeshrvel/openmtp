import React, { PureComponent, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import FolderIcon from '@material-ui/icons/Folder';
import { styles } from '../styles/SidebarAreaPaneLists';
import { quickHash } from '../../../utils/funcs';
import { analyticsService } from '../../../services/analytics';
import { EVENT_TYPE } from '../../../enums/events';

class SidebarAreaPaneLists extends PureComponent {
  _handleListDirectory({ ...args }) {
    const { onClickHandler, deviceType } = this.props;

    onClickHandler({ ...args });

    const deviceTypeUpperCase = deviceType.toUpperCase();

    analyticsService.sendEvent(
      EVENT_TYPE[`${deviceTypeUpperCase}_SIDEBAR_PATH_TAP`],
      {}
    );
  }

  ListsRender = (listData) => {
    const { classes: styles, deviceType, currentBrowsePath } = this.props;

    return (
      <List component="nav" dense className={styles.listsBottom}>
        {listData.map((item) => {
          return (
            <ListItem
              key={quickHash(item.path)}
              button
              selected={currentBrowsePath === item.path}
              disabled={!item.enabled}
              onClick={() =>
                this._handleListDirectory({
                  filePath: item.path,
                  deviceType,
                  isSidemenu: true,
                })
              }
            >
              <ListItemIcon className={styles.listIcon}>
                {item.icon === 'folder' && <FolderIcon />}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          );
        })}
      </List>
    );
  };

  render() {
    const { classes: styles, sidebarFavouriteList } = this.props;
    const { top: sidebarTop, bottom: sidebarBottom } = sidebarFavouriteList;

    return (
      <div className={styles.listsWrapper}>
        <Typography variant="caption" className={styles.listsCaption}>
          Favorites
        </Typography>
        {sidebarTop.length > 1 && this.ListsRender(sidebarTop)}

        {sidebarBottom.length > 1 && (
          <Fragment>
            <Divider />
            {this.ListsRender(sidebarBottom)}
          </Fragment>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(SidebarAreaPaneLists);
