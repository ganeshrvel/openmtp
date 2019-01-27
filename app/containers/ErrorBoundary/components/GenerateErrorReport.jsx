'use strict';

import React, { Component } from 'react';
import { shell, remote } from 'electron';
import path from 'path';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/GenerateErrorReport';
import { baseName, PATHS } from '../../../utils/paths';
import { log } from '@Log';
import { promisifiedRimraf, mtpVerboseReport } from '../../../api/sys';
import { fileExistsSync } from '../../../api/sys/fileOps';
import { AUTHOR_EMAIL } from '../../../constants/meta';
import { throwAlert } from '../../Alerts/actions';
import {
  mailToInstructions as _mailToInstructions,
  reportGenerateError,
  mailTo
} from '../../../templates/generateErrorReport';
import { compressFile } from '../../../utils/gzip';
import GenerateErrorReportBody from './GenerateErrorReportBody';

const { logFile } = PATHS;
const { getPath } = remote.app;
const desktopPath = getPath('desktop');
const zippedLogFileBaseName = `${baseName(logFile)}.gz`;
const logFileZippedPath = path.resolve(
  path.join(desktopPath, `./${zippedLogFileBaseName}`)
);
const mailToInstructions = _mailToInstructions(zippedLogFileBaseName);

class GenerateErrorReport extends Component {
  compressLog = () => {
    try {
      compressFile(logFile, logFileZippedPath);
    } catch (e) {
      log.error(e, `GenerateErrorReport -> compressLog`);
    }
  };

  handleGenerateErrorLogs = async () => {
    try {
      const { actionHandleThrowError } = this.props;

      await mtpVerboseReport();

      const { error } = await promisifiedRimraf(logFileZippedPath);

      if (error) {
        actionHandleThrowError({
          message: reportGenerateError
        });
        return null;
      }

      this.compressLog();

      if (!fileExistsSync(logFileZippedPath)) {
        actionHandleThrowError({
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
      <GenerateErrorReportBody
        styles={styles}
        zippedLogFileBaseName={zippedLogFileBaseName}
        mailTo={mailTo}
        mailToInstructions={mailToInstructions}
        AUTHOR_EMAIL={AUTHOR_EMAIL}
        onGenerateErrorLogs={this.handleGenerateErrorLogs}
      />
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      actionHandleThrowError: ({ ...args }) => (_, getState) => {
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
