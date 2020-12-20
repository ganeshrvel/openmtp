import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { styles } from '../styles/FileExplorerTableBodyEmptyHelpPhoneNotRecognizedRender';
import { openExternalUrl } from '../../../utils/url';
import {
  APP_GITHUB_ISSUES_URL,
  APP_NAME,
  APP_VERSION,
  AUTHOR_EMAIL,
} from '../../../constants/meta';
import { DONATE_PAYPAL_URL } from '../../../constants';
import { helpPhoneNotConnecting } from '../../../templates/fileExplorer';

class FileExplorerTableBodyEmptyHelpPhoneNotRecognizedRender extends PureComponent {
  render() {
    const { classes: styles } = this.props;

    return (
      <div className={styles.root}>
        <Paper elevation={0}>
          <Typography component="p" variant="body2">
            <strong>OpenMTP</strong> was a project that I started to solve a
            problem that was so personal to me. But I always knew, that
            there&apos;s a community, whose facing the same problem as I did.
          </Typography>
          <Typography component="p" variant="body2" paragraph>
            I wasn&apos;t wrong, I guess. Now, we are a strong community with
            users from over&nbsp;
            <strong>180 countries</strong>. It&apos;s overwhelming to see the
            response that I have received from all of you, not just appreciating
            the app, but also giving me suggestions and feedback to improve it.
          </Typography>

          <Typography component="p" variant="body2">
            As they say, you build for the community and learn from it.
          </Typography>

          <Typography component="p" variant="body2" paragraph>
            I read each and every message that you send and am constantly
            working to improve the app based on your feedback. Keep sending more
            of those :)
          </Typography>

          <Typography component="p" variant="body2" paragraph>
            Some of you have been telling me that there are issues with
            connecting certain mobile phones (<i>mostly Samsung</i>) to OpenMTP.
            I have been working hard to fix this issue by migrating the existing
            MTP Kernel to a better one.
          </Typography>

          <Typography component="p" variant="body2" paragraph>
            <strong>{`If you are trying to connect your Samsung device then you may need to
              accept the "Allow access to device data" confirmation pop up in your
              phone. Tap on the "Refresh" button in OpenMTP after that. Unplug, reconnect and
              try again if it doesn't help.`}</strong>
          </Typography>

          <Typography component="p" variant="body2" paragraph>
            You may reach out to me at&nbsp;
            <a
              href={`mailto:${AUTHOR_EMAIL}?Subject=${helpPhoneNotConnecting}&Body=${APP_NAME} - ${APP_VERSION}`}
            >
              {AUTHOR_EMAIL}
            </a>
            &nbsp;or check out this&nbsp;
            <a
              onClick={(events) => {
                openExternalUrl(`${APP_GITHUB_ISSUES_URL}8`, events);
              }}
            >
              thread
            </a>
            &nbsp;on GitHub for tracking the same,&nbsp;
            <i>to collaborate and make this community bigger and stronger</i>!
          </Typography>

          <Typography component="p" variant="body2" paragraph>
            If you&apos;d like to support my work or buy me up a cup of coffee,
            donate via&nbsp;
            <a
              onClick={(events) => {
                openExternalUrl(DONATE_PAYPAL_URL, events);
              }}
            >
              {DONATE_PAYPAL_URL}
            </a>
            .
          </Typography>

          <Typography component="p" variant="body2">
            <strong>Happy Transferring!</strong>
          </Typography>
        </Paper>
      </div>
    );
  }
}

export default withStyles(styles)(
  FileExplorerTableBodyEmptyHelpPhoneNotRecognizedRender
);
