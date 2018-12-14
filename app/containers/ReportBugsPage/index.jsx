'use strict';

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles';
import { log } from '@Log';
import { remote } from 'electron';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import GenerateErrorReport from '../ErrorBoundary/components/GenerateErrorReport';
import { Helmet } from 'react-helmet';
import { title } from '../../constants/meta';

class ReportBugsPage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes: styles } = this.props;
    return (
      <div className={styles.root}>
        <Helmet titleTemplate={`%s - ${title}`}>
          <title>Report Bugs</title>
        </Helmet>
        <GenerateErrorReport />
      </div>
    );
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
)(withStyles(styles)(ReportBugsPage));
