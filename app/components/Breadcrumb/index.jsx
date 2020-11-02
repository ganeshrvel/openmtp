'use strict';

import React, { PureComponent, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import Paper from '@material-ui/core/Paper';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import Tooltip from '@material-ui/core/Tooltip';
import { quickHash } from '../../utils/funcs';
import { styles } from './styles';
import { sanitizePath } from '../../utils/files';

class Breadcrumb extends PureComponent {
  _handleClickPath = (enabled, value, event) => {
    const { onBreadcrumbPathClick } = this.props;
    event.preventDefault();

    if (!enabled) {
      return null;
    }
    onBreadcrumbPathClick({ path: value });
  };

  tokenizeCurrentBrowsePath(currentBrowsePath) {
    const sanitizedCurrentBrowsePath = sanitizePath(currentBrowsePath);
    const _currentBrowsePath = [];
    let _bold = false;
    let _enabled = true;
    const currentBrowsePathBroken =
      sanitizedCurrentBrowsePath === '/'
        ? ['']
        : sanitizedCurrentBrowsePath.split('/');
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
          bold: _bold,
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

      return _currentBrowsePath.push({
        label,
        path: `${currentBrowsePathBroken.slice(0, index + 1).join('/')}`,
        isCompressed: _isCompressed,
        enabled: _enabled,
        bold: _bold,
      });
    });

    return _currentBrowsePath;
  }

  BreadcrumbCellRender(tokenizeCurrentBrowsePath) {
    const { classes: styles } = this.props;
    let compressedCounter = 0;

    return tokenizeCurrentBrowsePath.map((item, index) => {
      const { label, path, isCompressed, enabled, bold } = item;
      if (isCompressed) {
        compressedCounter += 1;
      }
      return (
        <Fragment key={quickHash(path)}>
          {isCompressed ? (
            this.CompressedBreadcrumbCellRender({
              isCompressed,
              compressedCounter,
            })
          ) : (
            <Fragment>
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
                      [`& bold`]: bold,
                    })}
                    onClick={(event) => {
                      this._handleClickPath(enabled, path, event);
                    }}
                  >
                    {label}
                  </a>
                </Tooltip>
              </li>
            </Fragment>
          )}
        </Fragment>
      );
    });
  }

  CompressedBreadcrumbCellRender({ compressedCounter }) {
    const { classes: styles } = this.props;
    return compressedCounter < 2 ? (
      <span>
        <KeyboardArrowRightIcon className={styles.breadcrumbSeperator} />
        <MoreHorizIcon className={styles.breadcrumbSeperator} />
      </span>
    ) : (
      <Fragment />
    );
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
}

export default withStyles(styles)(Breadcrumb);
