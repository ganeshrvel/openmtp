'use strict';

import React, { Component } from 'react';
import { styles } from '../styles/DirectoryListsTableFooter';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import Tooltip from '@material-ui/core/Tooltip';
import nanoid from 'nanoid';
import { sanitizePath } from '../../../utils/paths';

class DirectoryListsTableFooter extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      tokenizeCurrentBrowsePath: {}
    };
    this.state = {
      ...this.initialState
    };
  }

  handleClickPath = (value, event) => {
    event.preventDefault();
    console.log(value);
  };

  componentWillMount() {
    const { currentBrowsePath } = this.props;

    this.setState({
      tokenizeCurrentBrowsePath: this.tokenizeCurrentBrowsePath(
        currentBrowsePath
      )
    });
  }

  componentWillReceiveProps() {
    const { currentBrowsePath } = this.props;

    this.setState({
      tokenizeCurrentBrowsePath: this.tokenizeCurrentBrowsePath(
        currentBrowsePath
      )
    });
  }

  tokenizeCurrentBrowsePath(currentBrowsePath) {
    currentBrowsePath = sanitizePath(currentBrowsePath);
    let _currentBrowsePath = [];
    const currentBrowsePathBroken =
      currentBrowsePath === '/' ? [''] : currentBrowsePath.split('/');
    const WITHOUT_COMPRESSION_MAX_ITEMS = 4;
    const currentBrowsePathBrokenLength = currentBrowsePathBroken.length;
    const isCompressed =
      WITHOUT_COMPRESSION_MAX_ITEMS < currentBrowsePathBrokenLength;

    currentBrowsePathBroken.map((a, index) => {
      const label = a;
      let _isCompressed = false;
      if (a === '' && index === 0) {
        _currentBrowsePath.push({
          label: 'Root',
          path: '/',
          isCompressed: _isCompressed,
          enabled: true
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
        enabled: true
      });
    });

    return _currentBrowsePath;
  }

  render() {
    const { classes: styles } = this.props;

    return (
      <div className={styles.root}>
        <div className={styles.rootBreadcrumbs}>
          <Paper elevation={0}>
            <ul className={styles.breadcrumb}>{this.BreadcrumbCellRender()}</ul>
          </Paper>
        </div>
      </div>
    );
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

  BreadcrumbCellRender() {
    const { classes: styles } = this.props;
    const { tokenizeCurrentBrowsePath } = this.state;
    let compressedCounter = 0;

    return tokenizeCurrentBrowsePath.map((item, index) => {
      const { label, path, isCompressed, enabled } = item;
      if (isCompressed) {
        compressedCounter++;
      }
      return (
        <React.Fragment key={nanoid(8)}>
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
                    className={`${styles.breadcrumbLiA}`}
                    onClick={event => {
                      this.handleClickPath(path, event);
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
}

export default withStyles(styles)(DirectoryListsTableFooter);
