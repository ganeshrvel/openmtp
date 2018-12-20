'use strict';

import React, { Component } from 'react';
import { IS_PROD } from '../../constants/env';
import { theme, styles } from './styles';
import Alerts from '../Alerts';
import Titlebar from './components/Titlebar';
import ErrorBoundary from '../ErrorBoundary';
import { log } from '@Log';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import Routes from '../../routing';
import Boot from '../../classes/Boot';
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
const bootObj = new Boot();

class App extends Component {
  constructor(props) {
    super(props);
    this.initialState = {
      boot: {
        allow: true
      }
    };
    this.state = {
      ...this.initialState
    };

    this.isFreshInstall = false;
  }

  async componentWillMount() {
    try {
      //For an existing installation
      if (bootObj.quickVerify()) {
        this.writeJsonToSettings();
        return null;
      }

      //For a fresh installation
      await bootObj.init();
      const bootVerify = await bootObj.verify();
      if (!bootVerify) {
        this._preventAppBoot();
        return null;
      }

      this.setFreshInstall();
      this.writeJsonToSettings();
      this.runAnalytics();
    } catch (e) {
      this._preventAppBoot();
      log.error(e, `App -> componentWillMount`);
    }
  }

  componentDidMount() {
    try {
      bootObj.cleanRotationFiles();
    } catch (e) {
      log.error(e, `App -> componentDidMount`);
    }
  }

  setFreshInstall() {
    try {
      const isFreshInstallSettings = settingsStorage.getItems(['freshInstall']);
      this.isFreshInstall =
        bootObj.isFreshInstall() &&
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
      this._preventAppBoot();
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

  _preventAppBoot() {
    this.setState({
      boot: {
        allow: false
      }
    });

    return null;
  }

  render() {
    const { classes: styles } = this.props;
    const { boot } = this.state;
    if (!boot.allow) {
      return (
        <React.Fragment>
          <Titlebar />
          <Typography variant="subheading" className={styles.noProfileError}>
            Unable to load profile files. Please restart the app.
          </Typography>
        </React.Fragment>
      );
    }

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
