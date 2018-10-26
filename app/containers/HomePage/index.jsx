'use strict';

import React, { Component } from 'react';
import { styles } from './styles';
import { Helmet } from 'react-helmet';
import { log } from '@Log';
import FileExplorer from './components/FileExplorer';
import ToolbarAreaPane from './components/ToolbarAreaPane';
import { withStyles } from '@material-ui/core/styles';
import { withReducer } from '../../store/reducers/withReducer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import reducers from './reducers';
import Grid from '@material-ui/core/Grid';
import { deviceTypeConst } from '../../constants';

class Home extends Component {
  constructor(props) {
    super(props);
  }

  async componentWillMount() {
    /*
    todo: time out help tool tip
    todo: copy paste cut redo undo in prod
    todo: scan for mountable devices
    todo: optimization: add drive icons to list
    todo: change menus in prod and about electron
    todo: bump electron and mui versions
    todo: updates checking
    todo: email/report debug error  add version number to stack and email debug
   */
  }

  render() {
    const { classes: styles } = this.props;

    return (
      <Grid container spacing={0}>
        <Grid item xs={6}>
          <ToolbarAreaPane showMenu={true} deviceType={deviceTypeConst.local} />
          <FileExplorer hideColList={[]} deviceType={deviceTypeConst.local} />
        </Grid>
        <Grid item xs={6}>
          <ToolbarAreaPane showMenu={false} deviceType={deviceTypeConst.mtp} />
          <FileExplorer
            hideColList={['size']}
            deviceType={deviceTypeConst.mtp}
          />
        </Grid>
      </Grid>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({}, dispatch);

const mapStateToProps = (state, props) => {
  return {};
};

export default withReducer('Home', reducers)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(Home))
);
