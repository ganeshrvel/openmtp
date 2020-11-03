import { hot } from 'react-hot-loader/root';
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import {
  MuiThemeProvider,
  createMuiTheme,
  withStyles,
} from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Analytics from 'electron-ga';
import { log } from '@Log';
import { IS_PROD } from '../../constants/env';
import { materialUiTheme, styles } from './styles';
import Alerts from '../Alerts';
import Titlebar from './components/Titlebar';
import ErrorBoundary from '../ErrorBoundary';
import Routes from '../../routing';
import { bootLoader } from '../../utils/bootHelper';
import { settingsStorage } from '../../utils/storageHelper';
import SettingsDialog from '../Settings';
import { withReducer } from '../../store/reducers/withReducer';
import reducers from './reducers';
import { copyJsonFileToSettings, freshInstall } from '../Settings/actions';
import { isConnected } from '../../utils/isOnline';
import { TRACKING_ID } from '../../../config/google-analytics-key';
import { APP_NAME, APP_VERSION } from '../../constants/meta';
import {
  makeAppThemeMode,
  makeAppThemeModeSettings,
} from '../Settings/selectors';
import { getAppThemeMode } from '../../utils/theme';
import { getMainWindowRendererProcess } from '../../utils/windowHelper';

class App extends Component {
  constructor(props) {
    super(props);

    this.mainWindowRendererProcess = getMainWindowRendererProcess();

    this.allowWritingJsonToSettings = false;
  }

  componentWillMount() {
    try {
      this.setFreshInstall();

      if (this.allowWritingJsonToSettings) {
        this.writeJsonToSettings();
      }

      this.runAnalytics();
    } catch (e) {
      log.error(e, `App -> componentWillMount`);
    }
  }

  componentDidMount() {
    try {
      ipcRenderer.on('nativeThemeUpdated', this.nativeThemeUpdatedEvent);

      bootLoader.cleanRotationFiles();
    } catch (e) {
      log.error(e, `App -> componentDidMount`);
    }
  }

  componentWillUnmount() {
    this.deregisterAccelerators();
    ipcRenderer.removeListener(
      'nativeThemeUpdated',
      this.nativeThemeUpdatedEvent
    );

    this.mainWindowRendererProcess.webContents.removeListener(
      'nativeThemeUpdated',
      () => {}
    );
  }

  nativeThemeUpdatedEvent = () => {
    // force update the component
    this.setState({});
  };

  getMuiTheme = () => {
    const { appThemeModeSettings } = this.props;
    const appThemeMode = getAppThemeMode(appThemeModeSettings);

    return createMuiTheme(materialUiTheme({ appThemeMode }));
  };

  setFreshInstall() {
    try {
      const { actionCreateFreshInstall } = this.props;
      const setting = settingsStorage.getItems(['freshInstall']);
      let isFreshInstall = 0;

      switch (setting.freshInstall) {
        case undefined:
        case null:
          // app was just installed
          isFreshInstall = 1;
          break;
        case 1:
          // second boot after installation
          isFreshInstall = 0;
          break;
        case -1:
          // isFreshInstall was reset
          isFreshInstall = 1;
          break;
        case 0:
        default:
          // more than 2 boot ups have occured
          isFreshInstall = 0;
          this.allowWritingJsonToSettings = true;
          return null;
      }

      actionCreateFreshInstall({ isFreshInstall });
    } catch (e) {
      log.error(e, `App -> setFreshInstall`);
    }
  }

  writeJsonToSettings() {
    try {
      const { actionCreateCopyJsonFileToSettings } = this.props;
      const settingsFromStorage = settingsStorage.getAll();

      actionCreateCopyJsonFileToSettings({ ...settingsFromStorage });
    } catch (e) {
      log.error(e, `App -> writeJsonToSettings`);
    }
  }

  runAnalytics() {
    const isAnalyticsEnabledSettings = settingsStorage.getItems([
      'enableAnalytics',
    ]);

    try {
      if (isAnalyticsEnabledSettings.enableAnalytics && IS_PROD) {
        isConnected()
          .then((connected) => {
            const analytics = new Analytics(TRACKING_ID, {
              appName: APP_NAME,
              appVersion: APP_VERSION,
            });

            analytics.send('screenview', { cd: '/Home' });
            analytics.send(`pageview`, { dp: '/Home' });

            return connected;
          })
          .catch(() => {});
      }
    } catch (e) {
      log.error(e, `App -> runAnalytics`);
    }
  }

  render() {
    const { classes: styles } = this.props;
    const muiTheme = this.getMuiTheme();

    return (
      <div className={styles.root}>
        <MuiThemeProvider theme={muiTheme}>
          <CssBaseline />
          <Titlebar />
          <Alerts />
          <ErrorBoundary>
            <SettingsDialog />
            <Routes />
          </ErrorBoundary>
        </MuiThemeProvider>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      actionCreateCopyJsonFileToSettings: ({ ...data }) => (_, getState) => {
        dispatch(copyJsonFileToSettings({ ...data }));
      },

      actionCreateFreshInstall: ({ ...data }) => (_, getState) => {
        dispatch(freshInstall({ ...data }, getState));
      },
    },
    dispatch
  );

const mapStateToProps = (state) => {
  return {
    appThemeModeSettings: makeAppThemeModeSettings(state),
    appThemeMode: makeAppThemeMode(state),
  };
};

export default withReducer(
  'App',
  reducers
)(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(hot(App))));
