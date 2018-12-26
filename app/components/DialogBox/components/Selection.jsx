'use strict';

import React, { PureComponent } from 'react';
import { styles } from '../styles/Selection';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import Avatar from '@material-ui/core/Avatar';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import SdStorageIcon from '@material-ui/icons/SdStorage';

class Selection extends PureComponent {
  handleListItemClick = ({ ...args }) => {
    const { onClose } = this.props;
    onClose({ ...args });
  };

  render() {
    const { id, list, titleText, open, showDiskAvatars } = this.props;
    if (Object.keys(list).length < 1) {
      return <React.Fragment />;
    }
    return (
      <Dialog
        onClose={() =>
          this.handleListItemClick({
            selectedValue: null,
            triggerChange: false
          })
        }
        open={open}
      >
        <DialogTitle>{titleText}</DialogTitle>
        <div>
          <List>
            {Object.keys(list).map(a => {
              const item = list[a];
              return (
                <React.Fragment key={a}>
                  <ListItem
                    button
                    onClick={() =>
                      this.handleListItemClick({
                        selectedValue: a,
                        triggerChange: true
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
                </React.Fragment>
              );
            })}
          </List>
        </div>
      </Dialog>
    );
  }
}

export default withStyles(styles)(Selection);
