import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import BuildIcon from '@material-ui/icons/Build';
import KeyboardIcon from '@material-ui/icons/Keyboard';
import SmartphoneIcon from '@material-ui/icons/Smartphone';
import CameraRollIcon from '@material-ui/icons/CameraRoll';
import MemoryIcon from '@material-ui/icons/Memory';
import SystemUpdate from '@material-ui/icons/SystemUpdate';
import { styles } from '../styles/WhatsNew';
import { APP_NAME, APP_VERSION } from '../../../constants/meta';
import { isKalamModeSupported } from '../../../helpers/binaries';
import { MTP_MODE } from '../../../enums';

class WhatsNew extends PureComponent {
  render() {
    const isKalamModeDisabled = !isKalamModeSupported();
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
          {isKalamModeDisabled && (
            <ListItem>
              <ListItemIcon>
                <SystemUpdate htmlColor="#fa4d0a" />
              </ListItemIcon>
              <ListItemText
                primary={`We have now officially retired the support for '${MTP_MODE.kalam}' Kernel on macOS 10.13 (OS X El High Sierra) and lower`}
                secondary={`However the '${MTP_MODE.legacy}' MTP mode will continue working on these outdated machines`}
              />
            </ListItem>
          )}

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
              <KeyboardIcon />
            </ListItemIcon>
            <ListItemText primary="Shortcut improvements: Select a range of files using shift+click" />
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
