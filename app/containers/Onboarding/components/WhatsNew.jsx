import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import SpeedIcon from '@material-ui/icons/Speed';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import FolderIcon from '@material-ui/icons/Folder';
import SettingsOverscanIcon from '@material-ui/icons/SettingsOverscan';
import DescriptionIcon from '@material-ui/icons/Description';
import HourglassFullIcon from '@material-ui/icons/HourglassFull';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import FlipToBackIcon from '@material-ui/icons/FlipToBack';
import BuildIcon from '@material-ui/icons/Build';
import { styles } from '../styles/WhatsNew';
import { APP_NAME, APP_VERSION } from '../../../constants/meta';

class WhatsNew extends PureComponent {
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
            What&apos;s new in {APP_NAME}-{APP_VERSION}?
          </Typography>
        )}

        <List>
          <ListItem>
            <ListItemIcon>
              <SpeedIcon />
            </ListItemIcon>
            <ListItemText
              primary="New and Super performant 'Kalam' MTP kernel"
              secondary="Settings > 'General' Tab > 'MTP Mode' > Select 'Kalam Mode'"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FileCopyIcon />
            </ListItemIcon>
            <ListItemText
              primary="5-6x faster file copy speed"
              secondary="Settings > 'General' Tab > 'MTP Mode' > Select 'Kalam Mode'"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <WhatshotIcon htmlColor="#fa4d0a" />
            </ListItemIcon>
            <ListItemText
              primary="Much awaited Samsung phone support"
              secondary="Settings > 'General' Tab > 'MTP Mode' > Select 'Kalam Mode'"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Brightness4Icon />
            </ListItemIcon>
            <ListItemText
              primary="Dark Theme mode"
              secondary="Settings > 'General' Tab > 'Theme'"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FlipToBackIcon />
            </ListItemIcon>
            <ListItemText primary="Drag and Drop files from the macOS Finder window" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText primary="New file icons" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <HourglassFullIcon />
            </ListItemIcon>
            <ListItemText
              primary="Overall progress on the file transfer screen"
              secondary="Settings > 'File Manager' Tab > 'Display overall progress on the file transfer screen'"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FolderIcon />
            </ListItemIcon>
            <ListItemText
              primary="Show directories first"
              secondary="Settings > 'File Manager' Tab > 'Show directories first'"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SettingsOverscanIcon />
            </ListItemIcon>
            <ListItemText
              primary="Single pane mode"
              secondary="Settings > 'File Manager' Tab > 'Show Local Disk pane'"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText
              primary="Move the Local Disk pane to the right side"
              secondary="Settings > 'File Manager' Tab > 'Show Local Disk pane on the left side'"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <BuildIcon />
            </ListItemIcon>
            <ListItemText primary="Other UI optimization and performance improvements" />
          </ListItem>
        </List>
      </div>
    );
  }
}

export default withStyles(styles)(WhatsNew);
