'use strict';

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { styles } from '../styles/FileExplorerTableBodyEmptyHelpPhoneNotRecognizedRender';
import { openExternalUrl } from '../../../utils/url';
import { APP_NAME, APP_VERSION, AUTHOR_EMAIL } from '../../../constants/meta';

class FileExplorerTableBodyEmptyHelpPhoneNotRecognizedRender extends PureComponent {
  render() {
    const { classes: styles } = this.props;

    return (
      <div className={styles.root}>
        <Paper elevation={0}>
          <Typography component="p" paragraph>
            We have received feedback from various users that OpenMTP is not to
            able recognize certain devices even after following all the
            instructions. We have been working hard to migrate the existing MTP
            Kernel to a better one but the development has slowed down due to
            various reasons.
          </Typography>
          <Typography component="p" paragraph>
            We are looking for Node.js and C++ developers who can contribute to
            the development of the OpenMTP and help us migrate the existing MTP
            Kernel implementation to a newer one.
          </Typography>
          <Typography component="p">
            We have created a GitHub&nbsp;
            <a
              onClick={events => {
                openExternalUrl(
                  'https://github.com/ganeshrvel/openmtp/issues/8',
                  events
                );
              }}
            >
              thread
            </a>
            &nbsp;for tracking this issue and you may also reach us via&nbsp;
            <a
              href={`mailto:${AUTHOR_EMAIL}?Subject=Help - My phone is not recognized!&Body=${APP_NAME} - ${APP_VERSION}`}
            >
              {AUTHOR_EMAIL}
            </a>
            .
          </Typography>
        </Paper>
      </div>
    );
  }
}

export default withStyles(styles)(
  FileExplorerTableBodyEmptyHelpPhoneNotRecognizedRender
);
