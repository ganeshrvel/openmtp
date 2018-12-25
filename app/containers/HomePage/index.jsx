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

  componentWillMount() {
    if (document) {
      document.body.style.overflowY = 'hidden';
    }
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
            <FileExplorer
              hideColList={[]}
              deviceType={DEVICES_TYPE_CONST.local}
            />
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
