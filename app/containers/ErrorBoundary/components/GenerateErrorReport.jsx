'use strict';

import React, { Component } from 'react';
import { writeFile } from 'fs';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { styles } from '../styles/GenerateErrorReport';
import path from 'path';
import { baseName, PATHS } from '../../../utils/paths';
import { log } from '@Log';
import { shell, remote } from 'electron';
import { promisifiedRimraf, mtpVerboseReport } from '../../../api/sys';
import { fileExistsSync } from '../../../api/sys/fileOps';
import { AUTHOR_EMAIL } from '../../../constants';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { throwAlert } from '../../Alerts/actions';
import {
  mailToInstructions as _mailToInstructions,
  reportGenerateError,
  mailTo
} from '../../../templates/generateErrorReport';
import { compressFile } from '../../../utils/gzip';

const { logFile } = PATHS;
const { getPath } = remote.app;
const desktopPath = getPath('desktop');
const zippedLogFileBaseName = `${baseName(logFile)}.gz`;
const logFileZippedPath = path.resolve(
  path.join(desktopPath, `./${zippedLogFileBaseName}`)
);
const mailToInstructions = _mailToInstructions(zippedLogFileBaseName);

class GenerateErrorReport extends Component {
  constructor(props) {
    super(props);
  }

  compressLog = () => {
    try {
      compressFile(logFile, logFileZippedPath);
    } catch (e) {
      log.error(e, `GenerateErrorReport -> compressLog`);
    }
  };

  generateErrorLogs = async () => {
    try {
      const { handleThrowError } = this.props;

      await mtpVerboseReport();

      const { error } = await promisifiedRimraf(logFileZippedPath);

      if (error) {
        handleThrowError({
          message: reportGenerateError
        });
        return null;
      }

      this.compressLog();

      if (!fileExistsSync(logFileZippedPath)) {
        handleThrowError({
          message: reportGenerateError
        });
        return null;
      }

      if (window) {
        window.location.href = `${mailTo} ${mailToInstructions}`;
      }

      shell.showItemInFolder(logFileZippedPath);
    } catch (e) {
      log.error(e, `GenerateErrorReport -> generateErrorLogs`);
    }
  };

  render() {
    const { classes: styles } = this.props;
    return (
      <React.Fragment>
        <Typography variant="subtitle1" className={styles.subHeading}>
          <ul className={styles.instructions}>
            <li>Connect your phone to the computer via USB.</li>
            <li>Turn on the "File Transfer" mode.</li>
            <li>Click on the "EMAIL ERROR LOGS" button.</li>
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
          onClick={this.generateErrorLogs}
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
