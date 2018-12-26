'use strict';

import React, { PureComponent } from 'react';
import TableFooter from '@material-ui/core/TableFooter';
import Breadcrumb from '../../../components/Breadcrumb';

export class FileExplorerTableFooterRender extends PureComponent {
  constructor(props) {
    super(props);
  }

  _handleBreadcrumbPathClick = ({ ...args }) => {
    const { onBreadcrumbPathClick } = this.props;
  
    onBreadcrumbPathClick({ ...args });
  };

  render() {
    const { styles, currentBrowsePath, deviceType } = this.props;

    return (
      <TableFooter component="div" className={styles.tableFooter}>
        <Breadcrumb
          onBreadcrumbPathClick={this._handleBreadcrumbPathClick}
          currentBrowsePath={currentBrowsePath[deviceType]}
        />
      </TableFooter>
    );
  }
}
