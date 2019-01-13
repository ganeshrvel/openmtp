'use strict';

import React, { PureComponent } from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

export default class GenerateErrorReportBody extends PureComponent {
  render() {
    const {
      styles,
      zippedLogFileBaseName,
      mailTo,
      mailToInstructions,
      AUTHOR_EMAIL,
      onGenerateErrorLogs
    } = this.props;
    return (
      <React.Fragment>
        <Typography variant="subtitle1" className={styles.subHeading}>
          <ul className={styles.instructions}>
            <li>Connect your phone to the computer via USB.</li>
            <li>Turn on the &quot;File Transfer&quot; mode.</li>
            <li>Click on the &quot;EMAIL ERROR LOGS&quot; button.</li>
            <li>It will open your email client.</li>
            <li>
              Attach the generated error report
              <strong>{` ${zippedLogFileBaseName}`}</strong> (which is found in
              your Desktop folder) along with this email.
            </li>
            <li>Click send.</li>
          </ul>
        </Typography>
        <Button
          variant="outlined"
          color="secondary"
          className={styles.generateLogsBtn}
          onClick={onGenerateErrorLogs}
        >
          EMAIL ERROR LOGS
        </Button>
        <Typography variant="subtitle1" className={styles.emailIdWrapper}>
          <span>Developer email address: </span>
          <a
            href={`${mailTo} ${mailToInstructions}`}
            className={styles.emailId}
          >
            {AUTHOR_EMAIL}
          </a>
        </Typography>
      </React.Fragment>
    );
  }
}
