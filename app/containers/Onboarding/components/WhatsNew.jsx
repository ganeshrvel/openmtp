import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Keyboard from '@material-ui/icons/Keyboard';
import SystemUpdate from '@material-ui/icons/SystemUpdate';
import InsertChart from '@material-ui/icons/InsertChart';
import Tab from '@material-ui/icons/Tab';
import Settings from '@material-ui/icons/Settings';
import { styles } from '../styles/Features';
import { APP_NAME, APP_VERSION } from '../../../constants/meta';

class WhatsNew extends PureComponent {
  render() {
    const { classes: styles } = this.props;
    return (
      <div className={styles.root}>
        <Typography variant="body1" className={styles.title}>
          What&apos;s new in {APP_NAME}-{APP_VERSION}?
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <Keyboard />
            </ListItemIcon>
            <ListItemText primary="Keyboard Navigation" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Tab />
            </ListItemIcon>
            <ListItemText primary="New Tab Layout" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SystemUpdate />
            </ListItemIcon>
            <ListItemText primary="New Software Update Manager" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <InsertChart />
            </ListItemIcon>
            <ListItemText primary="New Onboarding UI" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="New Settings UI" />
          </ListItem>
        </List>
      </div>
    );
  }
}

export default withStyles(styles)(WhatsNew);
