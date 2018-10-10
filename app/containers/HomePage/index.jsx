'use strict';

import React, { Component } from 'react';
import { styles } from './styles';
import { Helmet } from 'react-helmet';
import { log } from '@Log';
import DirectoryLists from './components/DirectoryLists';
import ToolbarAreaPane from './components/ToolbarAreaPane';
import { withStyles } from '@material-ui/core/styles';
import { withReducer } from '../../store/reducers/withReducer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import reducers from './reducers';
import { throwAlert } from '@Alerts';
import Grid from '@material-ui/core/Grid';
import { deviceType } from '../../constants';

class Home extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    /*
    todo: show no data available error/message in table for mtp device
    todo: add menu btn fot mtp
    todo: binary for production
    todo: Side bar menu sdcard
   */
  }

  render() {
    const { classes: styles } = this.props;
    return (
      <React.Fragment>
        <Grid container spacing={0}>
          <Grid item xs={6}>
            <ToolbarAreaPane showMenu={true} deviceType={deviceType.local} />
            <DirectoryLists hideColList={[]} deviceType={deviceType.local} />
          </Grid>
          <Grid item xs={6}>
            <ToolbarAreaPane showMenu={false} deviceType={deviceType.mtp} />
            <DirectoryLists
              hideColList={['size']}
              deviceType={deviceType.mtp}
            />
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      throwAlert: (message, event) => (_, getState) => {
        dispatch(throwAlert({ message: message }));
      },
    },
    dispatch
  );

const mapStateToProps = (state, props) => {
  return {};
};

export default withReducer('Home', reducers)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(Home))
);
