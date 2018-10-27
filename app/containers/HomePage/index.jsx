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
import { deviceTypeConst } from '../../constants';

class Home extends Component {
  constructor(props) {
    super(props);
  }

  async componentWillMount() {
    /*
    todo: sometimes an "undefined" folder is created in the mtp path
    todo: time out help tool tip
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
      <div className={styles.root}>
        <div className={styles.grid}>
          <div className={styles.splitPane}>
            <ToolbarAreaPane
              showMenu={true}
              deviceType={deviceTypeConst.local}
            />
            <FileExplorer hideColList={[]} deviceType={deviceTypeConst.local} />
          </div>
          <div className={styles.splitPane}>
            <ToolbarAreaPane
              showMenu={false}
              deviceType={deviceTypeConst.mtp}
            />
            <FileExplorer
              hideColList={['size']}
              deviceType={deviceTypeConst.mtp}
            />
          </div>
        </div>
      </div>
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
