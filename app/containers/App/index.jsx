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
import { appBodyStylesStore, materialUiTheme, styles } from './styles';
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
import { setStyle } from '../../utils/styles';
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

      this.setAppTheme();
      this.runAnalytics();
    } catch (e) {
      log.error(e, `App -> componentWillMount`);
    }
  }

  componentDidMount() {
    try {
      ipcRenderer.on('nativeThemeUpdated', () => {
        this.setAppTheme();
        this.setState({});
      });

      bootLoader.cleanRotationFiles();
    } catch (e) {
      log.error(e, `App -> componentDidMount`);
    }
  }

  componentWillReceiveProps = ({
    appThemeModeSettings: nextAppThemeModeSettings,
  }) => {
    const { appThemeModeSettings } = this.props;

    if (nextAppThemeModeSettings !== appThemeModeSettings) {
      this.setAppTheme();
    }
  };

  componentWillUnmount() {
    this.deregisterAccelerators();

    this.mainWindowRendererProcess.webContents.removeListener(
      'nativeThemeUpdated',
      () => {}
    );
  }

  /**
   * Working: Toggle app theme without restart.
   * The styles are converted into css style variables and set to body tag; which will be available to the whole app
   *
   * How to add a new one:
   * 1) Add the css key to APP_THEME_COLOR_KEY in app/constants/theme.js; This is a dictionary of keys for easy referencing.
   * 2) Include the style to `appBodyStylesStore` in app/containers/App/styles/index.js as `[APP_THEME_COLOR_KEY.<colorName>]: color`
   * This will include the css styles as ---app-color-name: '#fff' to the body tag
   *
   * How to use the style variable in the app:
   * i) Add the styling variable to the `default` method app/styles/js/variables.js and refer to the css style as `variables().styles.colorName` (recommended).
   * ii) Refer the color in css/js as APP_THEME_COLOR_KEY.colorName
   * iii) Refer the color in css as var(--app-some-color) (least recommended)
   * */
  setAppTheme = () => {
    try {
      const setting = settingsStorage.getItems(['appThemeMode']);
      const appThemeMode = getAppThemeMode(setting.appThemeMode);

      const styleList = appBodyStylesStore({
        appThemeMode,
      });

      setStyle(document.body, styleList);
    } catch (e) {
      log.error(e, `App -> setAppTheme`);
    }
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
        <CssBaseline>
          <MuiThemeProvider theme={muiTheme}>
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
