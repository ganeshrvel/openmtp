'use strict';

import React, { Component } from 'react';
import { theme, styles } from './styles';
/*import ToolbarAreaPane from '../HomePage/components/ToolbarAreaPane';
import SidebarAreaPane from '../HomePage/components/SidebarAreaPane';
import MainAreaPane from './components/MainAreaPane';*/
import Alerts from '../Alerts';
import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import Routes from '../../routing';

const appTheme = createMuiTheme(theme());

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { classes: styles } = this.props;

    return (
      <React.Fragment>
        <CssBaseline>
          <MuiThemeProvider theme={appTheme}>
            <Alerts />
            <Routes />
            {/*<div className={styles.appContainer}>
              
              
              <SidebarAreaPane />
              <div>
                <ToolbarAreaPane />
                <MainAreaPane />
              </div>
            </div>*/}
          </MuiThemeProvider>
        </CssBaseline>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(App);
