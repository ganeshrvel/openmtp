'use strict';

import React, { Component } from 'react';
import { styles } from '../styles/ToolbarAreaPane';
import { imgsrc } from '../../../utils/imgsrc.js';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withReducer } from '../../../store/reducers/withReducer';
import reducers from '../reducers';
//import {} from '../actions';
import { makeIsLoading, makeToolbarList } from '../selectors';

class ToolbarAreaPane extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { classes: styles, toolbarList } = this.props;

    return (
      <div className={styles.root}>
        <AppBar position="static" elevation={0} className={styles.appBar}>
          <Toolbar className={styles.toolbar} disableGutters={true}>
            <div className={styles.toolbarInnerWrapper}>
              {Object.keys(toolbarList).map(a => {
                const item = toolbarList[a];
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
  bindActionCreators(
    {
      handleClick: (key, event) => (_, getState) => {}
    },
    dispatch
  );

const mapStateToProps = (state, props) => {
  return {
    toolbarList: makeToolbarList(state),
    isLoading: makeIsLoading(state)
  };
};

export default withReducer('App', reducers)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(ToolbarAreaPane))
);
