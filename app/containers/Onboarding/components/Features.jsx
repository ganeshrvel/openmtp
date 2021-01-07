import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import UsbIcon from '@material-ui/icons/Usb';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import ViewListIcon from '@material-ui/icons/ViewList';
import SdStorageIcon from '@material-ui/icons/SdStorage';
import FlipToBackIcon from '@material-ui/icons/FlipToBack';
import CollectionsIcon from '@material-ui/icons/Collections';
import Collapse from '@material-ui/core/Collapse';
import KeyboardIcon from '@material-ui/icons/Keyboard';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SettingsOverscanIcon from '@material-ui/icons/SettingsOverscan';
import HourglassFullIcon from '@material-ui/icons/HourglassFull';
import TabIcon from '@material-ui/icons/Tab';
import KeyboadShortcuts from '../../KeyboardShortcutsPage/components/KeyboadShortcuts';
import { styles } from '../styles/Features';
import { capitalize } from '../../../utils/funcs';
import { MTP_MODE } from '../../../enums';

class Features extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      expansionPanel: {
        keyboardNavigation: false,
      },
    };
  }

  _handleExpansionPanel = ({ key }) => {
    this.setState((prevState) => {
      return {
        expansionPanel: {
          ...prevState.expansionPanel,
          [key]: !prevState.expansionPanel[key],
        },
      };
    });
  };

  render() {
    const { classes: styles, hideTitle } = this.props;
    const { expansionPanel } = this.state;

    const kalamLabel = capitalize(MTP_MODE.kalam);

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
            <ListItemText
              primary="5-6x faster file copy speed"
              secondary={`Settings > 'General' Tab > 'MTP Mode' > Select '${kalamLabel} Mode'`}
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
              <CollectionsIcon />
            </ListItemIcon>
            <ListItemText primary="Transfer multiple files which are larger than 4GB in one go." />
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
              <SettingsOverscanIcon />
            </ListItemIcon>
            <ListItemText
              primary="Single pane mode"
              secondary="Settings > 'File Manager' Tab > 'Show Local Disk pane'"
            />
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
              <SdStorageIcon />
            </ListItemIcon>
            <ListItemText primary="Choose between Internal Memory and SD Card" />
          </ListItem>

          <ListItem
            button
            onClick={() =>
              this._handleExpansionPanel({
                key: 'keyboardNavigation',
              })
            }
          >
            <ListItemIcon>
              <KeyboardIcon />
            </ListItemIcon>
            <ListItemText
              primary="Keyboard Navigation"
              secondary={
                !expansionPanel.keyboardNavigation
                  ? 'Click here to view the keyboard shortcuts'
                  : 'Click here to hide the keyboard shortcuts'
              }
            />
            {expansionPanel.keyboardNavigation ? (
              <ExpandLessIcon />
            ) : (
              <ExpandMoreIcon />
            )}
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
          <Collapse
            in={expansionPanel.keyboardNavigation}
            timeout="auto"
            unmountOnExit
          >
            <List component="div" disablePadding>
              <ListItem>
                <div className={styles.nestedPanel}>
                  <KeyboadShortcuts />
                </div>
              </ListItem>
            </List>
          </Collapse>
        </List>
      </div>
    );
  }
}

export default withStyles(styles)(Features);
