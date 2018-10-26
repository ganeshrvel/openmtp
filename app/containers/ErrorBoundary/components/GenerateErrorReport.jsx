'use strict';

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { styles } from '../styles/GenerateErrorReport';
import path from 'path';
import { baseName, PATHS } from '../../../utils/paths';
import { log } from '@Log';
import { shell, remote } from 'electron';
import AdmZip from 'adm-zip';
import { promisifiedRimraf } from '../../../api/sys/index';
import { fileExistsSync } from '../../../api/sys/fileOps';
import { AUTHOR_EMAIL } from '../../../constants/index';
import { body, mailTo, subject } from '../../../templates/errorLog';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { throwAlert } from '../../Alerts/actions';

const { logFile } = PATHS;
const { getPath } = remote.app;
const desktopPath = getPath('desktop');
const logFileZippedPath = path.resolve(
  path.join(desktopPath, `./${baseName(logFile)}.zip`)
);
const zip = new AdmZip();

class GenerateErrorReport extends Component {
  constructor(props) {
    super(props);
  }

  compressLog = () => {
    try {
      zip.addLocalFile(logFile);
      zip.writeZip(logFileZippedPath);
    } catch (e) {
      log.error(e, `ErrorBoundary -> compressLog`);
    }
  };

  generateErrorLogs = async () => {
    const reportError = `Error report generation failed. Try again!`;
    try {
      const { error } = await promisifiedRimraf(logFileZippedPath);
      const { handleThrowError } = this.props;

      if (error) {
        handleThrowError({
          message: reportError
        });
        return null;
      }

      this.compressLog();

      if (!fileExistsSync(logFileZippedPath)) {
        handleThrowError({
          message: reportError
        });
        return null;
      }

      if (window) {
        window.location.href = mailTo;
      }

      shell.showItemInFolder(logFileZippedPath);
    } catch (e) {
      log.error(e, `ErrorBoundary -> generateErrorLogs`);
    }
  };

  render() {
    const { classes: styles } = this.props;
    return (
      <React.Fragment>
        <Typography variant="subheading" className={styles.subHeading}>
          Please send me the error logs so that I can fix this issue.
          <ul className={styles.instructions}>
            <li>Click on "GENERATE ERROR LOGS" button.</li>
            <li>It will open your email client.</li>
            <li>
              Attach the generated report (found in your Desktop folder) along
              with the email.
            </li>
            <li>Click send.</li>
          </ul>
        </Typography>
        <Button
          variant="outlined"
          color="secondary"
          className={styles.generateLogsBtn}
          onClick={this.generateErrorLogs}
        >
          EMAIL ERROR LOGS
        </Button>
        <Typography variant="subheading" className={styles.emailIdWrapper}>
          <span>Developer email address: </span>
          <a
            href={`mailto:${AUTHOR_EMAIL}?subject=${subject}&body=${body}`}
            className={styles.emailId}
          >
            {AUTHOR_EMAIL}
          </a>
        </Typography>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      handleThrowError: ({ ...args }) => (_, getState) => {
        dispatch(throwAlert({ ...args }));
      }
    },
    dispatch
  );

const mapStateToProps = (state, props) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(GenerateErrorReport));
