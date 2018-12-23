'use strict';

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { styles } from './styles';
import { imgsrc } from '../../utils/imgsrc';
import { log } from '@Log';
import { remote } from 'electron';
import { EOL } from 'os';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import GenerateErrorReport from './components/GenerateErrorReport';

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
    const _errorInfo = JSON.stringify(errorInfo);
    log.doLog(
      `Error boundary log capture:${EOL}${error.toString()}${EOL}${_errorInfo}`,
      true,
      error
    );
  }

  handleReload = () => {
    try {
      remote.getCurrentWindow().reload();
    } catch (e) {
      log.error(e, `ErrorBoundary -> handleReload`);
    }
  };

  render() {
    const { classes: styles } = this.props;
    if (this.state.errorInfo) {
      return (
        <div className={styles.root}>
          <img src={imgsrc('bug.svg', false)} className={styles.bugImg} />
          <Typography variant="h4" className={styles.headings}>
            Whoops!
          </Typography>
          <Typography variant="h5" className={styles.headings}>
            I promise it's not you, it's me.
          </Typography>
          <Typography variant="subtitle1" className={styles.subHeading}>
            Please send us the error log so that I can fix this issue.
          </Typography>
          <GenerateErrorReport />
          <Button
            variant="outlined"
            className={styles.goBackBtn}
            onClick={this.handleReload}
          >
            Reload
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({}, dispatch);

const mapStateToProps = (state, props) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ErrorBoundary));
