import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import SystemUpdateIcon from '@material-ui/icons/SystemUpdate';
import SentimentSatisfiedAltIcon from '@material-ui/icons/SentimentSatisfiedAlt';
import OfflineBoltIcon from '@material-ui/icons/OfflineBolt';
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
              <OfflineBoltIcon />
            </ListItemIcon>
            <ListItemText primary="Performance Optimizations" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SentimentSatisfiedAltIcon />
            </ListItemIcon>
            <ListItemText primary="UI Improvements" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SystemUpdateIcon />
            </ListItemIcon>
            <ListItemText
              primary="Software Update Manager Improvements"
              secondary="Settings > 'Software Update' Tab"
            />
          </ListItem>
        </List>
      </div>
    );
  }
}

export default withStyles(styles)(WhatsNew);
