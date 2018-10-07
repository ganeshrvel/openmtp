'use strict';

import React, { Component } from 'react';
import { styles } from './styles';
import { Helmet } from 'react-helmet';
import { log } from '@Log';
import { withStyles } from '@material-ui/core/styles';
import DirectoryLists from './components/DirectoryLists';
import ToolbarAreaPane from './components/ToolbarAreaPane';
import { withReducer } from '../../store/reducers/withReducer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import reducers from './reducers';
import { fetchDirList } from './actions';
import { throwAlert } from '@Alerts';
import {} from './selectors';
import Grid from '@material-ui/core/Grid';
import { asyncReadDir } from '../../api/sys';

class Home extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    /* asyncReadDir('filePath')
      .then(res => console.log(res))
      .catch(e => {
        this.props.throwAlert(e.message);
        log.error(e, `Homepage asyncReadDir`);
      });*/

    this.props.handleFetchDirList({ filePath: '/', ignoreHidden: true });
  }

  render() {
    const { classes: styles } = this.props;
    return (
      <React.Fragment>
        <ToolbarAreaPane />
        <div className={styles.root}>
          <DirectoryLists />
          {/* <Grid container spacing={0}>
            <Grid item xs={6}>
              <DirectoryLists />
            </Grid>
            <Grid item xs={6}>
              <DirectoryLists />
            </Grid>
          </Grid>*/}
        </div>
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
      handleFetchDirList: ({ ...args }) => (_, getState) => {
        dispatch(fetchDirList(args));
      }
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
