import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import UsbIcon from '@material-ui/icons/Usb';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import ViewListIcon from '@material-ui/icons/ViewList';
import SdStorageIcon from '@material-ui/icons/SdStorage';
import CollectionsIcon from '@material-ui/icons/Collections';
import TabIcon from '@material-ui/icons/Tab';
import { styles } from '../styles/Features';

class Features extends PureComponent {
  render() {
    const { classes: styles, hideTitle } = this.props;

    return (
      <div className={styles.root}>
        {hideTitle ? null : (
          <Typography
            variant="body1"
            className={styles.title}
            color="secondary"
          >
            Features
          </Typography>
        )}
        <List>
          <ListItem>
            <ListItemIcon>
              <UsbIcon />
            </ListItemIcon>
            <ListItemText
              primary="Connect via USB cable"
              secondary="Highest data transfer rates"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FileCopyIcon />
            </ListItemIcon>
            <ListItemText primary="Drag 'n Drop your files" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <TabIcon />
            </ListItemIcon>
            <ListItemText
              primary="Tab Layout"
              secondary="Use mouse clicks or keyboard shortcut to navigate through them"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <ViewListIcon />
            </ListItemIcon>
            <ListItemText
              primary="Choose between Grid and List view"
              secondary="Settings > 'File Manager' Tab"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SdStorageIcon />
            </ListItemIcon>
            <ListItemText primary="Choose between Internal Memory and SD Card" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CollectionsIcon />
            </ListItemIcon>
            <ListItemText primary="Transfer multiple files which are larger than 4GB in one go." />
          </ListItem>
        </List>
      </div>
    );
  }
}

export default withStyles(styles)(Features);
