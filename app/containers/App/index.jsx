'use strict';

import React, { Component } from 'react';
import { theme, styles } from './styles';
import Alerts from '../Alerts';
import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import Routes from '../../routing';
import bootApp from '../../utils/boot';
import SettingsDialog from '../Settings';
import { writeFileAsync } from '../../api/sys/fileOps';
import { PATHS } from '../../utils/paths';
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
    const bootObj = new bootApp();
    const bootInit = await bootObj.init();
    if (!bootInit) {
      this.setState({
        boot: {
          allow: false
        }
      });

      return null;
    }
    this.writeJsonToSettings();
  }

  writeJsonToSettings() {
    /* const settingFileJson = require(PATHS.settingFile);
    const { _copyJsonFileToSettings } = this.props;
    _copyJsonFileToSettings({ ...settingFileJson });
   */ writeFileAsync(
      {
        filePath: PATHS.settingFile,
        text: JSON.stringify({}),
        append: false
      }
    );
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
