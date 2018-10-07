'use strict';

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles';
import { Helmet } from 'react-helmet';
import { log } from '@Log';
import DirectoryLists from './components/DirectoryLists';
import { withReducer } from '../../store/reducers/withReducer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import reducers from './reducers';
import { fetchDirList } from './actions';
import { throwAlert } from '@Alerts';
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
        <div className={styles.root}>
          <div>
            <DirectoryLists />
          </div>
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
