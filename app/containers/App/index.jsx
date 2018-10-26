'use strict';

import React, { Component } from 'react';
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
import bootApp from '../../classes/boot';
import { settingsStorage } from '../../utils/storageHelper';
import SettingsDialog from '../Settings';
import { withReducer } from '../../store/reducers/withReducer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import reducers from './reducers';
import { copyJsonFileToSettings } from '../Settings/actions';

const appTheme = createMuiTheme(theme());
const bootObj = new bootApp();

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

      this.writeJsonToSettings();
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
      <React.Fragment>
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
      </React.Fragment>
    );
  }
}
const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      _copyJsonFileToSettings: ({ ...data }) => (_, getState) => {
        dispatch(copyJsonFileToSettings({ ...data }));
      }
    },
    dispatch
  );

const mapStateToProps = (state, props) => {
  return {};
};

export default withReducer('App', reducers)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(App))
);
