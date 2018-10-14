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
    todo: only reload storage ids on reload iff device changes ie, ids changes else just fetch directory with current device id
    todo: device storage ids change on device change, onclick dialog on storage list ->  fetch root, change selected path after that
    todo: do a mtp " directory name test
    todo: multiple mtp devices at same time
    todo: onscroll clear context menu
    todo: focus the datatable
    todo: new folder actions
    todo: togglehiddenfolders to showhiddenfolders
    todo: delete for local error for permission error/not found etc
    todo: folder/files different color
    todo: fix sizes in local
    todo: sometimes folders are mistaken as files eg: /Volume/Mac-SSD
    todo: fix sorting algorithm
    todo: selection blur or hide action for delete, up (/) and reload btns
    todo: add menu btn fot mtp
    todo: binary for production
    todo: Side bar menu sdcard
    todo: error boundary
    todo: copy paste cut redo undo in prod
   */
  }

  render() {
    const { classes: styles } = this.props;
    return (
      <React.Fragment>
        <Grid container spacing={0}>
          <Grid item xs={6}>
            <ToolbarAreaPane showMenu={true} deviceType={deviceTypeConst.local} />
            <DirectoryLists hideColList={[]} deviceType={deviceTypeConst.local} />
          </Grid>
          <Grid item xs={6}>
            <ToolbarAreaPane showMenu={false} deviceType={deviceTypeConst.mtp} />
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
