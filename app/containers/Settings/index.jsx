import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { styles } from './styles';
import { withReducer } from '../../store/reducers/withReducer';
import reducers from './reducers';
import { makeCommonSettings } from './selectors';
import {
  fileExplorerListingType,
  freshInstall,
  hideHiddenFiles,
  setCommonSettings,
  toggleSettings,
} from './actions';
import { reloadDirList } from '../HomePage/actions';
import {
  makeCurrentBrowsePath,
  makeMtpStoragesList,
} from '../HomePage/selectors';
import SettingsDialog from './components/SettingsDialog';

class Settings extends Component {
  _handleDialogBoxCloseBtnClick = ({ confirm = false }) => {
    const { freshInstall } = this.props;
    this._handleToggleSettings(confirm);

    if (freshInstall !== 0) {
      this._handleFreshInstall();
    }
  };

  _handleFreshInstall = () => {
    const { actionCreateFreshInstall } = this.props;

    actionCreateFreshInstall({ isFreshInstall: 0 });
  };

  _handleToggleSettings = (confirm) => {
    const { actionCreateToggleSettings } = this.props;
    actionCreateToggleSettings(confirm);
  };

  _handleHiddenFilesChange = (event, value, deviceType) => {
    const {
      actionCreateHideHiddenFiles,
      actionCreateReloadDirList,
      mtpStoragesList,
      currentBrowsePath,
    } = this.props;

    actionCreateHideHiddenFiles({ value }, deviceType);
    actionCreateReloadDirList(
      {
        filePath: currentBrowsePath[deviceType],
        ignoreHidden: value,
      },
      deviceType,
      mtpStoragesList
    );
  };

  _handleFileExplorerListingType = (event, value, deviceType) => {
    const { actionCreateFileExplorerListingType } = this.props;

    actionCreateFileExplorerListingType({ value }, deviceType);
  };

  _handleEnableBackgroundAutoUpdateChange = (event, value, deviceType) => {
    this._handleSetCommonSettingsChange(
      {
        key: 'enableBackgroundAutoUpdate',
        value,
      },
      deviceType
    );
  };

  _handleAutoUpdateCheckChange = (event, value, deviceType) => {
    this._handleSetCommonSettingsChange(
      {
        key: 'enableAutoUpdateCheck',
        value,
      },
      deviceType
    );
  };

  _handlePrereleaseUpdatesChange = (event, value, deviceType) => {
    this._handleSetCommonSettingsChange(
      {
        key: 'enablePrereleaseUpdates',
        value,
      },
      deviceType
    );
  };

  _handleAnalyticsChange = (event, value, deviceType) => {
    this._handleSetCommonSettingsChange(
      {
        key: 'enableAnalytics',
        value,
      },
      deviceType
    );
  };

  _handleStatusBarChange = (event, value, deviceType) => {
    this._handleSetCommonSettingsChange(
      {
        key: 'enableStatusBar',
        value,
      },
      deviceType
    );
  };

  _handleSetAppThemeModeChange = (event, value, deviceType) => {
    this._handleSetCommonSettingsChange(
      {
        key: 'appThemeMode',
        value,
      },
      deviceType
    );
  };

  _handleShowLocalPaneChange = (event, value, deviceType) => {
    this._handleSetCommonSettingsChange(
      {
        key: 'showLocalPane',
        value,
      },
      deviceType
    );
  };

  _handleShowLocalPaneOnLeftSideChange = (event, value, deviceType) => {
    this._handleSetCommonSettingsChange(
      {
        key: 'showLocalPaneOnLeftSide',
        value,
      },
      deviceType
    );
  };

  _handleSetCommonSettingsChange = ({ key, value }, deviceType) => {
    const { actionSetCommonSettings } = this.props;

    actionSetCommonSettings({ key, value }, deviceType);
  };

  render() {
    const {
      freshInstall,
      toggleSettings,
      appThemeMode,
      classes: styles,
      ...parentProps
    } = this.props;
    const showSettings = toggleSettings || freshInstall !== 0;

    return (
      <SettingsDialog
        open={showSettings}
        freshInstall={freshInstall}
        toggleSettings={toggleSettings}
        appThemeMode={appThemeMode}
        styles={styles}
        onAnalyticsChange={this._handleAnalyticsChange}
        onHiddenFilesChange={this._handleHiddenFilesChange}
        onFileExplorerListingType={this._handleFileExplorerListingType}
        onDialogBoxCloseBtnClick={this._handleDialogBoxCloseBtnClick}
        onAutoUpdateCheckChange={this._handleAutoUpdateCheckChange}
        onEnableBackgroundAutoUpdateChange={
          this._handleEnableBackgroundAutoUpdateChange
        }
        onPrereleaseUpdatesChange={this._handlePrereleaseUpdatesChange}
        onStatusBarChange={this._handleStatusBarChange}
        onAppThemeModeChange={this._handleSetAppThemeModeChange}
        onShowLocalPaneChange={this._handleShowLocalPaneChange}
        onShowLocalPaneOnLeftSideChange={
          this._handleShowLocalPaneOnLeftSideChange
        }
        {...parentProps}
      />
    );
  }
}

const mapDispatchToProps = (dispatch, _) =>
  bindActionCreators(
    {
      actionCreateToggleSettings: (data) => (_, __) => {
        dispatch(toggleSettings(data));
      },

      actionCreateFreshInstall: (data) => (_, getState) => {
        dispatch(freshInstall({ ...data }, getState));
      },

      actionCreateHideHiddenFiles: ({ ...data }, deviceType) => (
        _,
        getState
      ) => {
        dispatch(hideHiddenFiles({ ...data }, deviceType, getState));
      },

      actionCreateFileExplorerListingType: ({ ...data }, deviceType) => (
        _,
        getState
      ) => {
        dispatch(fileExplorerListingType({ ...data }, deviceType, getState));
      },

      actionSetCommonSettings: ({ key, value }, deviceType) => (
        _,
        getState
      ) => {
        dispatch(setCommonSettings({ key, value }, deviceType, getState));
      },

      actionCreateReloadDirList: ({ ...args }, deviceType, mtpStoragesList) => (
        _,
        getState
      ) => {
        dispatch(
          reloadDirList({ ...args }, deviceType, mtpStoragesList, getState)
        );
      },
    },
    dispatch
  );

const mapStateToProps = (state, _) => {
  const commonSettings = makeCommonSettings(state);

  return {
    currentBrowsePath: makeCurrentBrowsePath(state),
    mtpStoragesList: makeMtpStoragesList(state),
    ...commonSettings,
  };
};

export default withReducer(
  'Settings',
  reducers
)(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Settings)));
