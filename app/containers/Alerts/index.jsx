import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withReducer } from '../../store/reducers/withReducer';
import reducers from './reducers';
import { clearAlert } from './actions';
import Snackbars from '../../components/Snackbars';

class Alerts extends Component {
  _handleClose = () => {
    const { actionCreateClearAlert } = this.props;
    actionCreateClearAlert();
  };

  render() {
    const { Alerts } = this.props;
    const { message, variant, autoHideDuration } = Alerts;
    return (
      message && (
        <Snackbars
          OnSnackBarsCloseAlerts={() => this._handleClose()}
          message={message}
          variant={variant}
          autoHideDuration={autoHideDuration}
        />
      )
    );
  }
}

const mapDispatchToProps = (dispatch, __) =>
  bindActionCreators(
    {
      actionCreateClearAlert: () => (_, __) => {
        dispatch(clearAlert());
      },
    },
    dispatch
  );

const mapStateToProps = (state, __) => {
  return {
    Alerts: state.Alerts,
  };
};

export default withReducer(
  'Alerts',
  reducers
)(connect(mapStateToProps, mapDispatchToProps)(Alerts));
