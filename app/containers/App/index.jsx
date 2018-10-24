'use strict';

import React, { Component } from 'react';
import { theme, styles } from './styles';
import Alerts from '../Alerts';
import { log } from '@Log';
import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import Routes from '../../routing';
import bootApp from '../../utils/boot';
import { settingsStorage } from '../../utils/storage';
import SettingsDialog from '../Settings';
import { withReducer } from '../../store/reducers/withReducer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import reducers from './reducers';
import { copyJsonFileToSettings } from '../Settings/actions';

const appTheme = createMuiTheme(theme());

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
      const bootObj = new bootApp();
      const bootInit = await bootObj.init();
      if (!bootInit) {
        this._preventAppBoot();
        return null;
      }

      await this.writeJsonToSettings();
    } catch (e) {
      this._preventAppBoot();
      log.error(e, `App -> componentWillMount`);
    }
  }

  async writeJsonToSettings() {
    try {
     /* await settingsStorage.set('get', { //hey: 99 });
      await settingsStorage.getAll((error, response) => {
        //console.log(response);
      });*/

      //settingsStorage().setItem('batman', { name: 'Bruce Wayne' });
      // console.log(settingsStorage.getItem('batman'));
      //_copyJsonFileToSettings({});
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
          <p>Unable to load profile files.</p>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <CssBaseline>
          <MuiThemeProvider theme={appTheme}>
            <Alerts />
            <SettingsDialog />
            <Routes />
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
