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
import { fetchDirList } from './actions';
import { throwAlert } from '@Alerts';
import { makeDefaultSelectedPath } from './selectors';
import Grid from '@material-ui/core/Grid';

class Home extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const { defaultSelectedPath } = this.props;

    /*
    Todo: throw alerts for fetchDirList errors
    todo: make a const for mtp and local
    todo: make a const for default mtp filePath
    todo: show no data available error/message for mtp device
    todo: checkbox is selected for no data in the list
    todo: handle sort logic separately.
    
    asyncReadLocalDir('filePath')
      .then(res => console.log(res))
      .catch(e => {
        this.props.throwAlert(e.message);
        log.error(e, `Homepage asyncReadLocalDir`);
      });*/

    this.props.handleFetchDirList(
      {
        filePath: defaultSelectedPath.path,
        ignoreHidden: true
      },
      'local'
    );
    this.props.handleFetchDirList(
      {
        filePath: '/',
        ignoreHidden: false
      },
      'mtp'
    );
  }

  render() {
    const { classes: styles } = this.props;
    return (
      <React.Fragment>
        <Grid container spacing={0}>
          <Grid item xs={6}>
            <ToolbarAreaPane showMenu={true} deviceType="local" />
            <DirectoryLists hideColList={[]} deviceType="local" />
          </Grid>
          <Grid item xs={6}>
            <ToolbarAreaPane showMenu={false} deviceType="mtp" />
            <DirectoryLists hideColList={['size']} deviceType="mtp" />
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
      handleFetchDirList: ({ ...args }, deviceType) => (_, getState) => {
        dispatch(fetchDirList(args, deviceType));
      }
    },
    dispatch
  );

const mapStateToProps = (state, props) => {
  return { defaultSelectedPath: makeDefaultSelectedPath(state) };
};

export default withReducer('Home', reducers)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(Home))
);
