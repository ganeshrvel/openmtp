'use strict';

import React, { Component } from 'react';
import Snackbars from '../../components/Snackbars';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withReducer } from '../../store/reducers/withReducer';
import reducers from './reducers';
import { clearAlert } from './actions';

class Alerts extends React.Component {
  constructor(props) {
    super(props);
  }

  handleClose = event => {
    this.props.clearAlert();
  };

  render() {
    const { message, variant, autoHideDuration } = this.props.Alerts;
    return (
      message && (
        <Snackbars
          OnSnackBarsCloseAlerts={a => this.handleClose()}
          message={message}
          variant={variant}
          autoHideDuration={autoHideDuration}
        />
      )
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      clearAlert: (message, event) => (_, getState) => {
        dispatch(clearAlert());
      }
    },
    dispatch
  );

const mapStateToProps = (state, props) => {
  return {
    Alerts: state.Alerts
  };
};

export default withReducer('Alerts', reducers)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Alerts)
);
