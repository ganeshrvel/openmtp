'use strict';

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
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
            Please send us the error log so that we can fix this issue
          </Typography>
        </div>
      );
    }

    return this.props.children;
  }
}

export default withStyles(styles)(ErrorBoundary);
