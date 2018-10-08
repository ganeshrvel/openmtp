'use strict';

import React, { Component } from 'react';
import { styles } from '../styles/ToolbarAreaPane';
import { imgsrc } from '../../../utils/imgsrc.js';
import MenuIcon from '@material-ui/icons/Menu';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withReducer } from '../../../store/reducers/withReducer';
import SidebarAreaPaneLists from './SidebarAreaPaneLists';
import reducers from '../reducers';
import {} from '../actions';
import {
  makeIsLoading,
  makeSidebarFavouriteList,
  makeToolbarList
} from '../selectors';

class ToolbarAreaPane extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      toggleDrawer: false
    };
  }

  toggleDrawer = status => () => {
    this.setState({
      toggleDrawer: status
    });
  };

  render() {
    const {
      classes: styles,
      toolbarList,
      sidebarFavouriteList,
      deviceType,
      showMenu
    } = this.props;
    
    return (
      <div className={styles.root}>
        <Drawer
          open={this.state.toggleDrawer}
          onClose={this.toggleDrawer(false)}
        >
          <div
            tabIndex={0}
            role="button"
            onClick={this.toggleDrawer(false)}
            onKeyDown={this.toggleDrawer(false)}
          />
          <SidebarAreaPaneLists sidebarFavouriteList={sidebarFavouriteList} />
        </Drawer>
        <AppBar position="static" elevation={0} className={styles.appBar}>
          <Toolbar className={styles.toolbar} disableGutters={true}>
            {showMenu && (
              <IconButton
                color="inherit"
                aria-label="Open drawer"
                onClick={this.toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
            )}

            <div className={styles.toolbarInnerWrapper}>
              {Object.keys(toolbarList[deviceType]).map(a => {
                const item = toolbarList[deviceType][a];
                return (
                  <Tooltip key={a} title={item.label}>
                    <div>
                      <IconButton
                        aria-label={item.label}
                        disabled={!item.enabled}
                        className={classNames({
                          [styles.invertedNavBtns]: item.invert
                        })}
                      >
                        <img
                          src={imgsrc(item.imgSrc, false)}
                          className={classNames(styles.navBtns)}
                        />
                      </IconButton>
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}
const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({}, dispatch);

const mapStateToProps = (state, props) => {
  return {
    sidebarFavouriteList: makeSidebarFavouriteList(state),
    toolbarList: makeToolbarList(state),
    isLoading: makeIsLoading(state)
  };
};

export default withReducer('Home', reducers)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(ToolbarAreaPane))
);
