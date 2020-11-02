'use strict';

import React, { PureComponent, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import Avatar from '@material-ui/core/Avatar';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import SdStorageIcon from '@material-ui/icons/SdStorage';
import { styles } from '../styles/Selection';

class Selection extends PureComponent {
  _handleListItemClick = ({ ...args }) => {
    const { onClose } = this.props;
    onClose({ ...args });
  };

  render() {
    const { list, titleText, open, showDiskAvatars } = this.props;
    if (Object.keys(list).length < 1) {
      return <Fragment />;
    }
    return (
      <Dialog
        onClose={() =>
          this._handleListItemClick({
            selectedValue: null,
            triggerChange: false,
          })
        }
        open={open}
      >
        <DialogTitle>{titleText}</DialogTitle>
        <div>
          <List>
            {Object.keys(list).map((a) => {
              const item = list[a];
              return (
                <Fragment key={a}>
                  <ListItem
                    button
                    onClick={() =>
                      this._handleListItemClick({
                        selectedValue: a,
                        triggerChange: true,
                      })
                    }
                  >
                    {showDiskAvatars && (
                      <ListItemAvatar>
                        <Avatar>
                          <SdStorageIcon />
                        </Avatar>
                      </ListItemAvatar>
                    )}

                    <ListItemText primary={item.name} />
                  </ListItem>
                </Fragment>
              );
            })}
          </List>
        </div>
      </Dialog>
    );
  }
}

export default withStyles(styles)(Selection);
