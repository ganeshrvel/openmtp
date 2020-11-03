import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import GenerateErrorReport from '../ErrorBoundary/components/GenerateErrorReport';
import { APP_TITLE } from '../../constants/meta';
import { styles } from './styles';

class ReportBugsPage extends Component {
  render() {
    const { classes: styles } = this.props;
    return (
      <div className={styles.root}>
        <Helmet titleTemplate={`%s - ${APP_TITLE}`}>
          <title>Report Bugs</title>
        </Helmet>
        <GenerateErrorReport />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch, __) => bindActionCreators({}, dispatch);

const mapStateToProps = (_, __) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ReportBugsPage));
