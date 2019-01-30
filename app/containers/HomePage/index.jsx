'use strict';

import React, { Component } from 'react';
import { log } from '@Log';
import { withStyles } from '@material-ui/core/styles';
import FileExplorer from './components/FileExplorer';
import ToolbarAreaPane from './components/ToolbarAreaPane';
import { styles } from './styles';
import { DEVICES_TYPE_CONST } from '../../constants';

class Home extends Component {
  render() {
    const { classes: styles } = this.props;

    return (
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
    );
  }
}

export default withStyles(styles)(Home);
