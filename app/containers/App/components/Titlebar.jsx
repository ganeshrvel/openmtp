'use strict';

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/Titlebar';
import { toggleWindowSizeOnDoubleClick } from '../../../utils/titlebarDoubleClick';

class Titlebar extends PureComponent {
  render() {
    const { classes: styles } = this.props;
    return (
      <div
        onDoubleClick={() => {
          toggleWindowSizeOnDoubleClick();
        }}
        className={styles.root}
      />
    );
  }
}

export default withStyles(styles)(Titlebar);
