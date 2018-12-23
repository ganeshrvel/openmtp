'use strict';

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles';
import { log } from '@Log';
import { remote } from 'electron';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Helmet } from 'react-helmet';
import { APP_TITLE } from '../../constants/meta';

class PrivacyPolicyPage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes: styles } = this.props;
    return (
      <div className={styles.root}>
        <Helmet titleTemplate={`%s - ${APP_TITLE}`}>
          <title>Privacy Policy</title>
        </Helmet>
        
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
)(withStyles(styles)(PrivacyPolicyPage));
