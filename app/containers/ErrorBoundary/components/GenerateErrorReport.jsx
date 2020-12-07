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
import fileExplorerController from '../../../data/file-explorer/controllers/FileExplorerController';
import { DEVICE_TYPE } from '../../../enums';

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
    await this.startGeneratingReport({ error });
  };

  _handleGenerateErrorLogs = async () => {
    try {
      const { isReportBugsPage } = this.props;

      // if the generate button click action originated from the 'report bugs' page then use ipc channels to communicate
      // else use direct method click
      if (isReportBugsPage) {
        this.mainWindowRendererProcess.webContents.send(
          COMMUNICATION_EVENTS.reportBugsDisposeMtp,
          { logFileZippedPath }
        );

        ipcRenderer.once(
          COMMUNICATION_EVENTS.reportBugsDisposeMtpReply,
          this._reportBugsDisposeMtpReplyEvent
        );

        return;
      }

      // direct button click action if the generate button is within the error boundary
      await fileExplorerController.dispose({ deviceType: DEVICE_TYPE.mtp });

      await fileExplorerController.fetchDebugReport({
        deviceType: DEVICE_TYPE.mtp,
      });

      const { error } = await fileExplorerController.deleteFiles({
        deviceType: DEVICE_TYPE.local,
        fileList: [logFileZippedPath],
        storageId: null,
      });

      await this.startGeneratingReport({ error });
    } catch (e) {
      log.error(e, `GenerateErrorReport -> generateErrorLogs`);
    }
  };

  startGeneratingReport = async ({ error }) => {
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
