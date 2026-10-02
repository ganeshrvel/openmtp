import React, { PureComponent, Fragment } from 'react';
import classnames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import FileExplorer from './components/FileExplorer';
import ToolbarAreaPane from './components/ToolbarAreaPane';
import AdbDeviceManager from './components/AdbDeviceManager';
import AdbFileExplorerPane from './components/AdbFileExplorerPane';
import { styles } from './styles';
import Onboarding from '../Onboarding';
import { DEVICE_TYPE, MTP_MODE } from '../../enums';
import {
  makeMtpMode,
  makeShowLocalPane,
  makeShowLocalPaneOnLeftSide,
} from '../Settings/selectors';
import { makeAdbDevice } from './selectors';

class Home extends PureComponent {
  RenderLocalPane = () => {
    const { classes: styles } = this.props;

    return (
      <div className={styles.splitPane} key={DEVICE_TYPE.local}>
        <ToolbarAreaPane showMenu deviceType={DEVICE_TYPE.local} />
        <FileExplorer hideColList={[]} deviceType={DEVICE_TYPE.local} />
      </div>
    );
  };

  RenderMtpPane = () => {
    const { classes: styles, showLocalPane, mtpMode } = this.props;

    return (
      <div
        key={DEVICE_TYPE.mtp}
        className={classnames(styles.splitPane, {
          [styles.singlePane]: !showLocalPane,
        })}
      >
        <ToolbarAreaPane showMenu={false} deviceType={DEVICE_TYPE.mtp} />
        <FileExplorer
          hideColList={mtpMode === MTP_MODE.legacy ? ['size'] : []}
          deviceType={DEVICE_TYPE.mtp}
        />
      </div>
    );
  };

  /**
   * ADB pane — a proper split pane that replaces the MTP pane when an ADB
   * device is selected. The MTP pane is untouched; only the right-hand pane
   * slot changes based on whether an ADB device is connected.
   *
   * The existing AdbFileExplorerPane overlay dialog is kept for upload/download
   * since it uses a native file-picker, but the main file listing and toolbar
   * (up, refresh, delete, settings, faqs) are wired through the standard
   * ToolbarAreaPane + FileExplorer components using DEVICE_TYPE.adb.
   */
  RenderAdbPane = () => {
    const { classes: styles, showLocalPane } = this.props;

    return (
      <div
        key={DEVICE_TYPE.adb}
        className={classnames(styles.splitPane, {
          [styles.singlePane]: !showLocalPane,
        })}
      >
        <ToolbarAreaPane showMenu={false} deviceType={DEVICE_TYPE.adb} />
        <FileExplorer hideColList={[]} deviceType={DEVICE_TYPE.adb} />
      </div>
    );
  };

  render() {
    const {
      classes: styles,
      showLocalPane,
      showLocalPaneOnLeftSide,
      adbDevice,
    } = this.props;

    // When an ADB device is selected, show the ADB pane instead of MTP.
    // The MTP pane is always available via the MTP mode; both can coexist
    // but we show whichever right-hand pane is currently active.
    const showAdbPane = !!adbDevice.selected;

    let panes = [];

    if (showLocalPane) {
      panes.push(this.RenderLocalPane());
    }

    if (showAdbPane) {
      panes.push(this.RenderAdbPane());
    } else {
      panes.push(this.RenderMtpPane());
    }

    if (!showLocalPaneOnLeftSide) {
      panes = panes.reverse();
    }

    return (
      <Fragment>
        <Onboarding />
        <AdbDeviceManager />
        {/* AdbFileExplorerPane provides the upload/download file-picker overlay */}
        <AdbFileExplorerPane />
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
    mtpMode: makeMtpMode(state),
    showLocalPaneOnLeftSide: makeShowLocalPaneOnLeftSide(state),
    adbDevice: makeAdbDevice(state),
  };
};

export default connect(mapStateToProps, null)(withStyles(styles)(Home));
