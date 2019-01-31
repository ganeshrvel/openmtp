import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Collapse from '@material-ui/core/Collapse';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import KeyboardIcon from '@material-ui/icons/Keyboard';
import SystemUpdateIcon from '@material-ui/icons/SystemUpdate';
import InsertChartIcon from '@material-ui/icons/InsertChart';
import TabIcon from '@material-ui/icons/Tab';
import SettingsIcon from '@material-ui/icons/Settings';
import HelpIcon from '@material-ui/icons/Help';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import OfflineBoltIcon from '@material-ui/icons/OfflineBolt';
import { styles } from '../styles/WhatsNew';
import KeyboadShortcuts from '../../../components/KeyboardShortcuts';
import { APP_NAME, APP_VERSION } from '../../../constants/meta';

class WhatsNew extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      expansionPanel: {
        keyboardNavigation: false
      }
    };
  }

  _handleExpansionPanel = ({ key }) => {
    this.setState(prevState => {
      return {
        expansionPanel: {
          ...prevState.expansionPanel,
          [key]: !prevState.expansionPanel[key]
        }
      };
    });
  };

  render() {
    const { classes: styles } = this.props;
    const { expansionPanel } = this.state;

    return (
      <div className={styles.root}>
        <Typography variant="body1" className={styles.title} color="secondary">
          What&apos;s new in {APP_NAME}-{APP_VERSION}?
        </Typography>
        <List>
          <ListItem
            button
            onClick={() =>
              this._handleExpansionPanel({
                key: 'keyboardNavigation'
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
          <ListItem>
            <ListItemIcon>
              <TabIcon />
            </ListItemIcon>
            <ListItemText
              primary="New Tab Layout"
              secondary="Use mouse clicks or keyboard shortcut to navigate through them"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SystemUpdateIcon />
            </ListItemIcon>
            <ListItemText
              primary="New Software Update Manager"
              secondary="Release notes and many more"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <OfflineBoltIcon />
            </ListItemIcon>
            <ListItemText
              primary="Beta Test the App"
              secondary="Settings > 'Software Update' Tab"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <InsertChartIcon />
            </ListItemIcon>
            <ListItemText
              primary="New Onboarding UI"
              secondary="Latest software update information"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText
              primary="New Settings UI"
              secondary="Enjoy the new tabbed view"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText
              primary="New Instructions UI"
              secondary="Android device connectivity instructions and features at a glance"
            />
          </ListItem>
        </List>
      </div>
    );
  }
}

export default withStyles(styles)(WhatsNew);
