import React, { PureComponent, Fragment } from 'react';
import classnames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import FileExplorer from './components/FileExplorer';
import ToolbarAreaPane from './components/ToolbarAreaPane';
import { styles } from './styles';
import Onboarding from '../Onboarding';
import { DEVICE_TYPE } from '../../enums';
import {
  makeShowLocalPane,
  makeShowLocalPaneOnLeftSide,
} from '../Settings/selectors';

class Home extends PureComponent {
  RenderLocalPane = () => {
    const { classes: styles } = this.props;

    return (
      <div className={styles.splitPane}>
        <ToolbarAreaPane showMenu deviceType={DEVICE_TYPE.local} />
        <FileExplorer hideColList={[]} deviceType={DEVICE_TYPE.local} />
      </div>
    );
  };

  RenderMtpPane = () => {
    const { classes: styles, showLocalPane } = this.props;

    return (
      <div
        className={classnames(styles.splitPane, {
          [styles.singlePane]: !showLocalPane,
        })}
      >
        <ToolbarAreaPane showMenu={false} deviceType={DEVICE_TYPE.mtp} />
        <FileExplorer hideColList={['size']} deviceType={DEVICE_TYPE.mtp} />
      </div>
    );
  };

  render() {
    const {
      classes: styles,
      showLocalPane,
      showLocalPaneOnLeftSide,
    } = this.props;

    const { RenderLocalPane, RenderMtpPane } = this;

    let panes = [];

    if (showLocalPane) {
      panes.push(<RenderLocalPane key={DEVICE_TYPE.local} />);
    }

    panes.push(<RenderMtpPane key={DEVICE_TYPE.mtp} />);

    if (!showLocalPaneOnLeftSide) {
      panes = panes.reverse();
    }

    return (
      <Fragment>
        <Onboarding />
        <div className={styles.root}>
          <div className={styles.grid}>{panes}</div>
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    showLocalPane: makeShowLocalPane(state),
    showLocalPaneOnLeftSide: makeShowLocalPaneOnLeftSide(state),
  };
};

export default connect(mapStateToProps, null)(withStyles(styles)(Home));
