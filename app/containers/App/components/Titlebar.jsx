'use strict';

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/Titlebar';
import { toggleWindowSizeOnDoubleClick } from '../../../utils/titlebarDoubleClick';
import { APP_TITLEBAR_DOM_ID } from '../../../constants/dom';

class Titlebar extends PureComponent {
  render() {
    const { classes: styles } = this.props;
    return (
      <div
        onDoubleClick={() => {
          toggleWindowSizeOnDoubleClick();
        }}
        className={styles.root}
        id={APP_TITLEBAR_DOM_ID}
      />
    );
  }
}

export default withStyles(styles)(Titlebar);
