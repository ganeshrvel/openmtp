'use strict';

import React, { Component } from 'react';
import { styles } from './styles';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import Paper from '@material-ui/core/Paper';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import Tooltip from '@material-ui/core/Tooltip';
import { sanitizePath } from '../../utils/paths';
import { quickHash } from '../../utils/funcs';

class Breadcrumb extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      tokenizeCurrentBrowsePath: {}
    };
    this.state = {
      ...this.initialState
    };
  }

  handleClickPath = (enabled, value, event) => {
    const { onBreadcrumbPathClickHandler } = this.props;
    event.preventDefault();

    if (!enabled) {
      return null;
    }
    onBreadcrumbPathClickHandler({ path: value });
  };

  tokenizeCurrentBrowsePath(currentBrowsePath) {
    currentBrowsePath = sanitizePath(currentBrowsePath);
    let _currentBrowsePath = [];
    let _bold = false;
    let _enabled = true;
    const currentBrowsePathBroken =
      currentBrowsePath === '/' ? [''] : currentBrowsePath.split('/');
    const WITHOUT_COMPRESSION_MAX_ITEMS = 3;
    const currentBrowsePathBrokenLength = currentBrowsePathBroken.length;
    const isCompressed =
      WITHOUT_COMPRESSION_MAX_ITEMS < currentBrowsePathBrokenLength;

    currentBrowsePathBroken.map((a, index) => {
      const label = a;
      let _isCompressed = false;
      if (index === currentBrowsePathBrokenLength - 1) {
        _bold = true;
        _enabled = false;
      }
      if (a === '' && index === 0) {
        _currentBrowsePath.push({
          label: 'Root',
          path: '/',
          isCompressed: _isCompressed,
          enabled: _enabled,
          bold: _bold
        });
        return null;
      }

      if (
        isCompressed &&
        index < currentBrowsePathBrokenLength - 2 &&
        index >= WITHOUT_COMPRESSION_MAX_ITEMS
      ) {
        _isCompressed = true;
      }

      _currentBrowsePath.push({
        label: label,
        path: `${currentBrowsePathBroken.slice(0, index + 1).join('/')}`,
        isCompressed: _isCompressed,
        enabled: _enabled,
        bold: _bold
      });
    });

    return _currentBrowsePath;
  }

  render() {
    const { classes: styles, currentBrowsePath } = this.props;

    return (
      <div className={styles.root}>
        <div className={styles.rootBreadcrumbs}>
          <Paper elevation={0}>
            <ul className={styles.breadcrumb}>
              {this.BreadcrumbCellRender(
                this.tokenizeCurrentBrowsePath(currentBrowsePath)
              )}
            </ul>
          </Paper>
        </div>
      </div>
    );
  }

  BreadcrumbCellRender(tokenizeCurrentBrowsePath) {
    const { classes: styles } = this.props;
    let compressedCounter = 0;

    return tokenizeCurrentBrowsePath.map((item, index) => {
      const { label, path, isCompressed, enabled, bold } = item;
      if (isCompressed) {
        compressedCounter++;
      }
      return (
        <React.Fragment key={quickHash(path)}>
          {isCompressed ? (
            this.CompressedBreadcrumbCellRender({
              isCompressed,
              compressedCounter
            })
          ) : (
            <React.Fragment>
              {index > 0 && (
                <span>
                  <KeyboardArrowRightIcon
                    className={styles.breadcrumbSeperator}
                  />
                </span>
              )}
              <li className={`${styles.breadcrumbLi}`}>
                <Tooltip title={label}>
                  <a
                    className={classNames(styles.breadcrumbLiA, {
                      [`& bold`]: bold
                    })}
                    onClick={event => {
                      this.handleClickPath(enabled, path, event);
                    }}
                  >
                    {label}
                  </a>
                </Tooltip>
              </li>
            </React.Fragment>
          )}
        </React.Fragment>
      );
    });
  }

  CompressedBreadcrumbCellRender({ isCompressed, compressedCounter }) {
    const { classes: styles } = this.props;
    return compressedCounter < 2 ? (
      <span>
        <KeyboardArrowRightIcon className={styles.breadcrumbSeperator} />
        <MoreHorizIcon className={styles.breadcrumbSeperator} />
      </span>
    ) : (
      <React.Fragment />
    );
  }
}

export default withStyles(styles)(Breadcrumb);
