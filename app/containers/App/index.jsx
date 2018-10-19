'use strict';

import React, { Component } from 'react';
import { theme, styles } from './styles';
import Alerts from '../Alerts';
import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import Routes from '../../routing';
import bootApp from '../../utils/boot';

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
            <Routes />
          </MuiThemeProvider>
        </CssBaseline>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(App);
