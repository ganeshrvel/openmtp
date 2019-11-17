import React, { Component, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import FileExplorer from './components/FileExplorer';
import ToolbarAreaPane from './components/ToolbarAreaPane';
import { styles } from './styles';
import { DEVICES_TYPE_CONST } from '../../constants';
import Onboarding from '../Onboarding';

class Home extends Component {
  render() {
    const { classes: styles } = this.props;

    return (
      <Fragment>
        <Onboarding />
        <div className={styles.root}>
          <div className={styles.grid}>
            <div className={styles.splitPane}>
              <ToolbarAreaPane showMenu deviceType={DEVICES_TYPE_CONST.local} />
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
      </Fragment>
    );
  }
}

export default withStyles(styles)(Home);
