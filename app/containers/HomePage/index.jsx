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
import { deviceTypeConst } from '../../constants';

class Home extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    /*
    todo: scan for mountable devices
    todo: loader for mtp!
    todo: onscroll clear context menu
    todo: focus the datatable
    todo: folder/files different color
    todo: sometimes folders are mistaken as files eg: /Volume/Mac-SSD
    todo: selection blur or hide action for delete, up (/) and reload btns
    todo: binary for production
    todo: error boundary
    todo: copy paste cut redo undo in prod
    todo: optimization: add drive icons to list
    todo: show hidden items
   */
  }

  render() {
    const { classes: styles } = this.props;
    return (
      <React.Fragment>
        <Grid container spacing={0}>
          <Grid item xs={6}>
            <ToolbarAreaPane
              showMenu={true}
              deviceType={deviceTypeConst.local}
            />
            <DirectoryLists
              hideColList={[]}
              deviceType={deviceTypeConst.local}
            />
          </Grid>
          <Grid item xs={6}>
            <ToolbarAreaPane
              showMenu={false}
              deviceType={deviceTypeConst.mtp}
            />
            <DirectoryLists
              hideColList={['size']}
              deviceType={deviceTypeConst.mtp}
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
