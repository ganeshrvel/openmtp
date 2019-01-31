import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import FileCopy from '@material-ui/icons/FileCopy';
import ViewList from '@material-ui/icons/ViewList';
import SdStorage from '@material-ui/icons/SdStorage';
import Collections from '@material-ui/icons/Collections';
import Usb from '@material-ui/icons/Usb';
import { styles } from '../styles/Features';

class Features extends PureComponent {
  render() {
    const { classes: styles } = this.props;
    return (
      <div className={styles.root}>
        <Typography variant="body1" className={styles.title}>
          Other Features
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <Usb />
            </ListItemIcon>
            <ListItemText
              primary="Connect via USB cable"
              secondary="Highest data transfer rates"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FileCopy />
            </ListItemIcon>
            <ListItemText primary="Drag 'n Drop feature available" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <ViewList />
            </ListItemIcon>
            <ListItemText
              primary="Choose between Grid and List view"
              secondary='Settings > "General" Tab'
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SdStorage />
            </ListItemIcon>
            <ListItemText primary="Choose between Internal Memory and SD Card" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Collections />
            </ListItemIcon>
            <ListItemText primary="Transfer multiple files which are larger than 4GB in one go." />
          </ListItem>
        </List>
      </div>
    );
  }
}

export default withStyles(styles)(Features);
