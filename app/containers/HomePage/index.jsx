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
import Grid from '@material-ui/core/Grid';
import { deviceTypeConst } from '../../constants';
import { clearContextMenuPos } from './actions';

class Home extends Component {
  constructor(props) {
    super(props);
    this.initialState = {
      contextMenu: {
        toggle: false,
        deviceType: null
      }
    };
    this.state = {
      ...this.initialState
    };
  }

  componentWillMount() {
    /*
    todo: binary for production
    todo: error boundary
    todo: copy paste cut redo undo in prod
    todo: loader for mtp!
    todo: scan for mountable devices
    todo: optimization: add drive icons to list
    todo: show hidden items
    todo: make: both ' and " accessible in file path
    todo: title bar style change
   */
  }

  onClickHandler = event => {
    const { handleClearContextMenuClick } = this.props;
    const { contextMenu } = this.state;
    if (contextMenu.toggle) {
      handleClearContextMenuClick(contextMenu.deviceType);
    }

    this.contextMenuClear();
  };

  onDirectoryListsClickHandler = (deviceType, toggle) => {
    if (!toggle) {
      this.contextMenuClear();
      return null;
    }

    this.setState({
      contextMenu: {
        toggle: true,
        deviceType: deviceType
      }
    });
  };

  contextMenuClear = () => {
    this.setState({
      contextMenu: {
        ...this.initialState.contextMenu
      }
    });
  };

  render() {
    const { classes: styles } = this.props;
    return (
      <Grid container spacing={0} onClick={this.onClickHandler}>
        <Grid item xs={6}>
          <ToolbarAreaPane showMenu={true} deviceType={deviceTypeConst.local} />
          <DirectoryLists
            onHomePageRootClickHandler={this.onDirectoryListsClickHandler}
            hideColList={[]}
            deviceType={deviceTypeConst.local}
          />
        </Grid>
        <Grid item xs={6}>
          <ToolbarAreaPane showMenu={false} deviceType={deviceTypeConst.mtp} />
          <DirectoryLists
            onHomePageRootClickHandler={this.onDirectoryListsClickHandler}
            hideColList={['size']}
            deviceType={deviceTypeConst.mtp}
          />
        </Grid>
      </Grid>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      handleClearContextMenuClick: deviceType => (_, getState) => {
        dispatch(clearContextMenuPos(deviceType));
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
