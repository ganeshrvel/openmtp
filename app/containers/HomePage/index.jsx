import React, { PureComponent, Fragment } from 'react';
import classnames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import FileExplorer from './components/FileExplorer';
import ToolbarAreaPane from './components/ToolbarAreaPane';
import { styles } from './styles';
import Onboarding from '../Onboarding';
import { DEVICE_TYPE } from '../../enums';
import { makeShowLocalPane } from '../Settings/selectors';

class Home extends PureComponent {
  render() {
    const { classes: styles, showLocalPane } = this.props;
    return (
      <Fragment>
        <Onboarding />
        <div className={styles.root}>
          <div className={styles.grid}>
            {showLocalPane && (
              <div className={styles.splitPane}>
                <ToolbarAreaPane showMenu deviceType={DEVICE_TYPE.local} />
                <FileExplorer hideColList={[]} deviceType={DEVICE_TYPE.local} />
              </div>
            )}

            <div
              className={classnames(styles.splitPane, {
                [styles.singlePane]: !showLocalPane,
              })}
            >
              <ToolbarAreaPane showMenu={false} deviceType={DEVICE_TYPE.mtp} />
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

const mapStateToProps = (state) => {
  return {
    showLocalPane: makeShowLocalPane(state),
  };
};

export default connect(mapStateToProps, null)(withStyles(styles)(Home));
