'use strict';

import React, { PureComponent } from 'react';
import TableFooter from '@material-ui/core/TableFooter';
import Breadcrumb from '../../../components/Breadcrumb';

export class FileExplorerTableFooterRender extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      styles,
      currentBrowsePath,
      deviceType,
      onBreadcrumbPathClick
    } = this.props;

    return (
      <TableFooter component="div" className={styles.tableFooter}>
        <Breadcrumb
          onBreadcrumbPathClick={onBreadcrumbPathClick}
          currentBrowsePath={currentBrowsePath[deviceType]}
        />
      </TableFooter>
    );
  }
}
