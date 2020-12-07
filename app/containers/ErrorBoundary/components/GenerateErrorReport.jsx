import React, { PureComponent } from 'react';
import { shell, remote, ipcRenderer } from 'electron';
import path from 'path';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/GenerateErrorReport';
import { PATHS } from '../../../constants/paths';
import { fileExistsSync } from '../../../helpers/fileOps';
import { AUTHOR_EMAIL } from '../../../constants/meta';
import { throwAlert } from '../../Alerts/actions';
import {
  mailToInstructions as _mailToInstructions,
  reportGenerateError,
  mailTo,
} from '../../../templates/generateErrorReport';
import { compressFile } from '../../../utils/gzip';
import GenerateErrorReportBody from './GenerateErrorReportBody';
import { baseName } from '../../../utils/files';
import { log } from '../../../utils/log';
import { getMainWindowRendererProcess } from '../../../helpers/windowHelper';
import { COMMUNICATION_EVENTS } from '../../../enums/communicationEvents';

const { logFile } = PATHS;
const { getPath } = remote.app;
const desktopPath = getPath('desktop');
const zippedLogFileBaseName = `${baseName(logFile)}.gz`;
const logFileZippedPath = path.resolve(
  path.join(desktopPath, `./${zippedLogFileBaseName}`)
);
const mailToInstructions = _mailToInstructions(zippedLogFileBaseName);

class GenerateErrorReport extends PureComponent {
  constructor() {
    super();

    this.mainWindowRendererProcess = getMainWindowRendererProcess();
  }

  componentWillUnmount() {
    ipcRenderer.removeListener(
      COMMUNICATION_EVENTS.reportBugsDisposeMtpReply,
      this._reportBugsDisposeMtpReplyEvent
    );
  }

  compressLog = () => {
    try {
      compressFile(logFile, logFileZippedPath);
    } catch (e) {
      log.error(e, `GenerateErrorReport -> compressLog`);
    }
  };

  _reportBugsDisposeMtpReplyEvent = async (_, { error }) => {
    const { actionCreateThrowError } = this.props;

    if (error) {
      actionCreateThrowError({
        message: reportGenerateError,
      });

      return null;
    }

    this.compressLog();

    if (!fileExistsSync(logFileZippedPath)) {
      actionCreateThrowError({
        message: reportGenerateError,
      });

      return null;
    }

    if (window) {
      window.location.href = `${mailTo} ${mailToInstructions}`;
    }

    shell.showItemInFolder(logFileZippedPath);
  };

  _handleGenerateErrorLogs = async () => {
    try {
      this.mainWindowRendererProcess.webContents.send(
        COMMUNICATION_EVENTS.reportBugsDisposeMtp,
        { logFileZippedPath }
      );

      ipcRenderer.once(
        COMMUNICATION_EVENTS.reportBugsDisposeMtpReply,
        this._reportBugsDisposeMtpReplyEvent
      );
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
        onGenerateErrorLogs={this._handleGenerateErrorLogs}
      />
    );
  }
}

const mapDispatchToProps = (dispatch, __) =>
  bindActionCreators(
    {
      actionCreateThrowError: ({ ...args }) => (_, __) => {
        dispatch(throwAlert({ ...args }));
      },
    },
    dispatch
  );

const mapStateToProps = (_, __) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(GenerateErrorReport));
