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
import { fetchDirList } from '../actions';
import {
  makeIsLoading,
  makeSidebarFavouriteList,
  makeToolbarList
} from '../selectors';
import { makeSelectedPath } from '../selectors';
import { makeToggleHiddenFiles } from '../../Settings/selectors';
class ToolbarAreaPane extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      toggleDrawer: false
    };
  }

  handleToggleDrawer = status => () => {
    this.setState({
      toggleDrawer: status
    });
  };

  handleToolbarAction = itemType => {
    const { selectedPath, deviceType } = this.props;
    let path = '/';
    switch (itemType) {
      case 'up':
        path =
          selectedPath[deviceType].replace(/\/$/, '').replace(/\/[^/]+$/, '') ||
          '/';
        this._fetchDirList({ path, deviceType });
        break;
      case 'refresh':
        path = selectedPath[deviceType];
        this._fetchDirList({ path, deviceType });
        break;
      default:
        break;
    }
  };

  _fetchDirList = ({ path, deviceType, isSidemenu = false }) => {
    const { handleFetchDirList, toggleHiddenFiles } = this.props;

    handleFetchDirList(
      {
        filePath: path,
        ignoreHidden: toggleHiddenFiles[deviceType]
      },
      deviceType
    );
    if (isSidemenu) {
      this.handleToggleDrawer(false)();
    }
  };

  render() {
    const {
      classes: styles,
      toolbarList,
      sidebarFavouriteList,
      deviceType,
      showMenu,
      selectedPath
    } = this.props;

    return (
      <div className={styles.root}>
        <Drawer
          open={this.state.toggleDrawer}
          onClose={this.handleToggleDrawer(false)}
        >
          <div
            tabIndex={0}
            role="button"
            onClick={this.handleToggleDrawer(false)}
            onKeyDown={this.handleToggleDrawer(false)}
          />
          <SidebarAreaPaneLists
            onClickHandler={this._fetchDirList}
            sidebarFavouriteList={sidebarFavouriteList}
            deviceType={deviceType}
            selectedPath={selectedPath[deviceType]}
          />
        </Drawer>
        <AppBar position="static" elevation={0} className={styles.appBar}>
          <Toolbar className={styles.toolbar} disableGutters={true}>
            {showMenu && (
              <IconButton
                color="inherit"
                aria-label="Open drawer"
                onClick={this.handleToggleDrawer(true)}
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
                        onClick={events => this.handleToolbarAction(a)}
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
  bindActionCreators(
    {
      handleFetchDirList: ({ ...args }, deviceType) => (_, getState) => {
        dispatch(fetchDirList(args, deviceType));
      }
    },
    dispatch
  );

const mapStateToProps = (state, props) => {
  return {
    sidebarFavouriteList: makeSidebarFavouriteList(state),
    toolbarList: makeToolbarList(state),
    isLoading: makeIsLoading(state),
    selectedPath: makeSelectedPath(state),
    toggleHiddenFiles: makeToggleHiddenFiles(state)
  };
};

export default withReducer('Home', reducers)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(ToolbarAreaPane))
);
