import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import SpeedIcon from '@material-ui/icons/Speed';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import BugReportIcon from '@material-ui/icons/BugReport';
import BuildIcon from '@material-ui/icons/Build';
import { styles } from '../styles/WhatsNew';
import { APP_NAME, APP_VERSION } from '../../../constants/meta';
import { MTP_MODE } from '../../../enums';
import { capitalize } from '../../../utils/funcs';

class WhatsNew extends PureComponent {
  render() {
    const { classes: styles, hideTitle } = this.props;

    const kalamLabel = capitalize(MTP_MODE.kalam);

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
              <BugReportIcon htmlColor="#fa4d0a" />
            </ListItemIcon>
            <ListItemText
              primary="Fixed a bug which prevented the users from accessing the restricted user directories"
              secondary={`Now users can access their Desktop, Downloads, Photos and Documents directories without any issue`}
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <OpenInNewIcon />
            </ListItemIcon>
            <ListItemText
              primary={`New - "Open in Finder" Context menu option in the Local Disk pane`}
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <SpeedIcon />
            </ListItemIcon>
            <ListItemText
              primary={`New and Super performant '${kalamLabel}' MTP kernel`}
              secondary={`Settings > 'General' Tab > 'MTP Mode' > Select '${kalamLabel} Mode'`}
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <WhatshotIcon />
            </ListItemIcon>
            <ListItemText
              primary="Much awaited Samsung phone support"
              secondary={`Settings > 'General' Tab > 'MTP Mode' > Select '${kalamLabel} Mode'`}
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
