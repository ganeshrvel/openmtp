'use strict';

import React, { Component } from 'react';
import { IS_PROD } from '../../constants/env';
import { theme, styles } from './styles';
import Alerts from '../Alerts';
import Titlebar from './components/Titlebar';
import ErrorBoundary from '../ErrorBoundary';
import { log } from '@Log';
import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import Routes from '../../routing';
import { bootLoader } from '../../utils/bootHelper';
import { settingsStorage } from '../../utils/storageHelper';
import SettingsDialog from '../Settings';
import { withReducer } from '../../store/reducers/withReducer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import reducers from './reducers';
import { copyJsonFileToSettings, freshInstall } from '../Settings/actions';
import { analytics } from '../../utils/analyticsHelper';
import { makeEnableAnalytics } from '../Settings/selectors';

const appTheme = createMuiTheme(theme());

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.isFreshInstall = false;
  }

  async componentWillMount() {
    try {
      this.setFreshInstall();
      this.writeJsonToSettings();
      this.runAnalytics();
    } catch (e) {
      log.error(e, `App -> componentWillMount`);
    }
  }

  componentDidMount() {
    try {
      bootLoader.cleanRotationFiles();
    } catch (e) {
      log.error(e, `App -> componentDidMount`);
    }
  }

  setFreshInstall() {
    try {
      const isFreshInstallSettings = settingsStorage.getItems(['freshInstall']);
      this.isFreshInstall =
        bootLoader.isFreshInstall() &&
        isFreshInstallSettings.freshInstall !== false;

      if (!this.isFreshInstall) {
        return null;
      }

      const { _freshInstall } = this.props;
      _freshInstall({ isFreshInstall: this.isFreshInstall });
    } catch (e) {
      log.error(e, `App -> setFreshInstall`);
    }
  }

  writeJsonToSettings() {
    try {
      const { _copyJsonFileToSettings } = this.props;
      const settingsFromStorage = settingsStorage.getAll();
      _copyJsonFileToSettings({ ...settingsFromStorage });
    } catch (e) {
      log.error(e, `App -> writeJsonToSettings`);
    }
  }

  runAnalytics() {
    //todo: check for fresh install in the Boot || Storage -> (add this to boot)
    //todo: only if internet available proceed
    const { enableAnalytics } = this.props;
    try {
      //todo: fixme uncomment is_prod
      if (enableAnalytics /* && IS_PROD*/) {
        analytics.send('screenview', { cd: '/Home' });
        analytics.send(`pageview`, { dp: '/Home' });
      }
    } catch (e) {
      log.error(e, `App -> runAnalytics`);
    }
  }

  render() {
    const { classes: styles } = this.props;
    return (
      <div className={styles.root}>
        <CssBaseline>
          <MuiThemeProvider theme={appTheme}>
            <Titlebar />
            <Alerts />
            <ErrorBoundary>
              <SettingsDialog />
              <Routes />
            </ErrorBoundary>
          </MuiThemeProvider>
        </CssBaseline>
      </div>
    );
  }
}
const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      _copyJsonFileToSettings: ({ ...data }) => (_, getState) => {
        dispatch(copyJsonFileToSettings({ ...data }));
      },

      _freshInstall: ({ ...data }) => (_, getState) => {
        dispatch(freshInstall({ ...data }, getState));
      }
    },
    dispatch
  );

const mapStateToProps = (state, props) => {
  return {
    enableAnalytics: makeEnableAnalytics(state)
  };
};

export default withReducer('App', reducers)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(App))
);
