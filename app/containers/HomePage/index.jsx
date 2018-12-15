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
import { DEVICES_TYPE_CONST } from '../../constants';

class Home extends Component {
  constructor(props) {
    super(props);
  }

  async componentWillMount() {
    /*
    todo: data and download progressbar in the taskbar
    todo: privacy policy
    todo: autoupdate settings and logic
    todo: crash report and analytics -> onboarding the first time users
    todo: display version number and release notes in updates
    todo: opt out of auto updates check and analytics in settings
    todo: opt out of auto updates check in the popup
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
    todo: when you close the lid while update download is in process,
      "A javaScript error occured in the main process: Uncaught Exception: " error is thrown
      add process.on('uncaughtException', function (error) {
              // Handle the error
          }
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
              deviceType={DEVICES_TYPE_CONST.local}
            />
            <FileExplorer hideColList={[]} deviceType={DEVICES_TYPE_CONST.local} />
          </div>
          <div className={styles.splitPane}>
            <ToolbarAreaPane
              showMenu={false}
              deviceType={DEVICES_TYPE_CONST.mtp}
            />
            <FileExplorer
              hideColList={['size']}
              deviceType={DEVICES_TYPE_CONST.mtp}
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
