import React, { Component } from 'react';
import { styles } from './styles';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withReducer } from '../../store/reducers/withReducer';
import reducers from './reducers';
import {
  makeToggleSettings,
  makeHideHiddenFiles,
  makeEnableAutoUpdateCheck,
  makeEnableAnalytics,
  makeFreshInstall
} from './selectors';
import {
  enableAnalytics,
  enableAutoUpdateCheck,
  freshInstall,
  hideHiddenFiles,
  toggleSettings
} from './actions';
import { handleReloadDirList } from '../HomePage/actions';
import {
  makeCurrentBrowsePath,
  makeMtpStoragesList
} from '../HomePage/selectors';
import { SettingsDialog } from './components/SettingsDialog';

class Settings extends Component {
  constructor(props) {
    super(props);
  }

  handleClick = ({ confirm = false }) => {
    const { freshInstall } = this.props;
    this._handleToggleSettings(confirm);

    if (freshInstall !== 0) {
      this._handleFreshInstall();
    }
  };

  _handleToggleSettings = confirm => {
    const { handleToggleSettings } = this.props;
    handleToggleSettings(confirm);
  };

  _handleFreshInstall = () => {
    const { handleFreshInstall } = this.props;

    handleFreshInstall({ isFreshInstall: 0 });
  };

  handleHiddenFilesChange = ({ ...args }, deviceType) => {
    const {
      handleHideHiddenFiles,
      handleReloadDirList,
      mtpStoragesList,
      currentBrowsePath
    } = this.props;
    const { toggle } = args;

    handleHideHiddenFiles({ ...args }, deviceType);
    handleReloadDirList(
      {
        filePath: currentBrowsePath[deviceType],
        ignoreHidden: toggle
      },
      deviceType,
      mtpStoragesList
    );
  };

  handleAutoUpdateCheckChange = ({ ...args }) => {
    const { handleEnableAutoUpdateCheck } = this.props;

    handleEnableAutoUpdateCheck({ ...args });
  };

  handleAnalytics = ({ ...args }) => {
    const { handleEnableAnalytics } = this.props;

    handleEnableAnalytics({ ...args });
  };

  render() {
    const {
      freshInstall,
      toggleSettings,
      hideHiddenFiles,
      classes: styles,
      enableAutoUpdateCheck,
      enableAnalytics
    } = this.props;
    const showSettings = toggleSettings || freshInstall !== 0;

    if (showSettings) {
      return (
        <SettingsDialog
          freshInstall={freshInstall}
          toggleSettings={toggleSettings}
          hideHiddenFiles={hideHiddenFiles}
          styles={styles}
          enableAutoUpdateCheck={enableAutoUpdateCheck}
          enableAnalytics={enableAnalytics}
          handleAnalytics={this.handleAnalytics}
          handleHiddenFilesChange={this.handleHiddenFilesChange}
          handleClick={this.handleClick}
          handleAutoUpdateCheckChange={this.handleAutoUpdateCheckChange}
        />
      );
    }
    return <React.Fragment />;
  }
}

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      handleToggleSettings: data => (_, getState) => {
        dispatch(toggleSettings(data));
      },

      handleFreshInstall: data => (_, getState) => {
        dispatch(freshInstall({ ...data }, getState));
      },

      handleHideHiddenFiles: ({ ...data }, deviceType) => (_, getState) => {
        dispatch(hideHiddenFiles({ ...data }, deviceType, getState));
      },

      handleEnableAutoUpdateCheck: ({ ...data }) => (_, getState) => {
        dispatch(enableAutoUpdateCheck({ ...data }, getState));
      },

      handleEnableAnalytics: ({ ...data }) => (_, getState) => {
        dispatch(enableAnalytics({ ...data }, getState));
      },

      handleReloadDirList: ({ ...args }, deviceType, mtpStoragesList) => (
        _,
        getState
      ) => {
        dispatch(
          handleReloadDirList(
            { ...args },
            deviceType,
            mtpStoragesList,
            getState
          )
        );
      }
    },
    dispatch
  );

const mapStateToProps = (state, props) => {
  return {
    freshInstall: makeFreshInstall(state),
    toggleSettings: makeToggleSettings(state),
    hideHiddenFiles: makeHideHiddenFiles(state),
    enableAutoUpdateCheck: makeEnableAutoUpdateCheck(state),
    enableAnalytics: makeEnableAnalytics(state),
    currentBrowsePath: makeCurrentBrowsePath(state),
    mtpStoragesList: makeMtpStoragesList(state)
  };
};

export default withReducer('Settings', reducers)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(Settings))
);
