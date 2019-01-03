'use strict';

import React, { PureComponent } from 'react';
import { styles } from '../styles/FileExplorerTableFooterRender';
import { withStyles } from '@material-ui/core/styles';
import TableFooter from '@material-ui/core/TableFooter';
import Breadcrumb from '../../../components/Breadcrumb';

class FileExplorerTableFooterRender extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      classes: styles,
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

export default withStyles(styles)(FileExplorerTableFooterRender);
