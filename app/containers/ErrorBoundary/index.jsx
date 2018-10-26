'use strict';

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { styles } from './styles';
import { imgsrc } from '../../utils/imgsrc';

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

  handleSendErrorLogs() {
    console.log(1);
    sendmail(
      {
        from: `bug-report@openmtp`,
        to: `ganeshrnet@live.com`,
        subject: `An error was reported`
      },
      (err, reply) => {
        console.log(err && err.stack);
        console.dir(reply);
      }
    );
  }

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
            I promise it's not you, it's us.
          </Typography>
          <Typography variant="subheading" className={styles.subHeading}>
            Please send us the error logs so that we can fix this issue.
          </Typography>
          <Button
            variant="outlined"
            color="secondary"
            className={styles.sendErrorLogsBtn}
            onClick={this.handleSendErrorLogs}
          >
            SEND ERROR LOGS
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default withStyles(styles)(ErrorBoundary);
