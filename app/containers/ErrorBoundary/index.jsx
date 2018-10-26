'use strict';

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { styles } from './styles';
import { imgsrc } from '../../utils/imgsrc';
import * as path from 'path';
import { baseName, PATHS } from '../../utils/paths';
import { log } from '@Log';
import { shell, remote } from 'electron';
import admZip from 'adm-zip';
import { promisifiedRimraf } from '../../api/sys';
import { fileExistsSync } from '../../api/sys/fileOps';
import { AUTHOR_EMAIL } from '../../constants';
import { body, mailTo, subject } from '../../templates/errorLog';

const { logFile } = PATHS;
const { getPath } = remote.app;
const desktopPath = getPath('desktop');
const logFileZippedPath = path.resolve(
  path.join(desktopPath, `./${baseName(logFile)}.zip`)
);
const zip = new admZip();

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null
    };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    //todo: error log
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
    try {
      const { error } = await promisifiedRimraf(logFileZippedPath);

      if (error) {
        //todo: throw error
        return;
      }

      this.compressLog();

      if (!fileExistsSync(logFileZippedPath)) {
        //todo: throw error
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
    if (!this.state.errorInfo) {
      return (
        <div className={styles.root}>
          <img src={imgsrc('bug.svg', false)} className={styles.bugImg} />
          <Typography variant="display1" className={styles.headings}>
            Whoops!
          </Typography>
          <Typography variant="headline" className={styles.headings}>
            I promise it's not you, it's me.
          </Typography>
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
        </div>
      );
    }

    return this.props.children;
  }
}

export default withStyles(styles)(ErrorBoundary);
