import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import BuildIcon from '@material-ui/icons/Build';
import SmartphoneIcon from '@material-ui/icons/Smartphone';
import CameraRollIcon from '@material-ui/icons/CameraRoll';
import MemoryIcon from '@material-ui/icons/Memory';
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
              <MemoryIcon htmlColor="#fa4d0a" />
            </ListItemIcon>
            <ListItemText primary="Much awaited Apple Silicon support" />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <SmartphoneIcon />
            </ListItemIcon>
            <ListItemText primary={`Garmin device support`} />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CameraRollIcon />
            </ListItemIcon>
            <ListItemText primary={`Fujifilm device support`} />
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
