

import React, { Component, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import FileExplorer from './components/FileExplorer';
import ToolbarAreaPane from './components/ToolbarAreaPane';
import { styles } from './styles';
import Onboarding from '../Onboarding';
import { DEVICE_TYPE } from "../../enums";

class Home extends Component {
  render() {
    const { classes: styles } = this.props;

    return (
      <Fragment>
        <Onboarding />
        <div className={styles.root}>
          <div className={styles.grid}>
            <div className={styles.splitPane}>
              <ToolbarAreaPane showMenu deviceType={DEVICE_TYPE.local} />
              <FileExplorer
                hideColList={[]}
                deviceType={DEVICE_TYPE.local}
              />
            </div>
            <div className={styles.splitPane}>
              <ToolbarAreaPane
                showMenu={false}
                deviceType={DEVICE_TYPE.mtp}
              />
              <FileExplorer
                hideColList={['size']}
                deviceType={DEVICE_TYPE.mtp}
              />
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default withStyles(styles)(Home);
