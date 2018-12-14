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
    todo: autoupdate settings and logic
    todo: .env
    todo: tags for github
    todo: in copy/paste, new folder, replace/merge, confirm, rename dialogues add the device name or sd card/int memory name
    todo: fix: drag files from local to mtp and then drop it back in the local. the merge dialog will appear
    todo: look into pure components
    todo: share the app link
    todo: donate via paypal
    todo: app store
    todo: update to the binary
    todo: generate report should append ./mtp ls -v to the log before emailing
    todo: Set target Babel
    todo: bump electron and mui versions
    todo: updates checking
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
