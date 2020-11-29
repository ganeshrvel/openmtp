import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/Titlebar';
import { toggleWindowSizeOnDoubleClick } from '../../../utils/titlebarDoubleClick';
import { APP_TITLEBAR_DOM_ID } from '../../../constants/dom';
import { isEmpty, niceBytes } from '../../../utils/funcs';
import { getSelectedStorage } from '../../HomePage/actions';

class Titlebar extends PureComponent {
  render() {
    const { classes: styles, mtpDevice, mtpStoragesList } = this.props;

    const selectedStorage = getSelectedStorage(mtpStoragesList);

    return (
      <div
        onDoubleClick={() => {
          toggleWindowSizeOnDoubleClick();
        }}
        className={styles.root}
        id={APP_TITLEBAR_DOM_ID}
      >
        {mtpDevice?.isAvailable &&
          mtpDevice?.info &&
          !isEmpty(selectedStorage?.data?.info) && (
            <span className={styles.deviceInfo}>
              <span className={styles.deviceModel}>
                {mtpDevice?.info?.Model}&nbsp;({selectedStorage?.data?.name}
                )&nbsp;-&nbsp;
              </span>
              {niceBytes(
                parseInt(selectedStorage?.data.info.FreeSpaceInBytes ?? 0, 10)
              )}
              &nbsp;Free of&nbsp;
              {niceBytes(
                parseInt(selectedStorage?.data.info.MaxCapability ?? 0, 10)
              )}
            </span>
          )}
      </div>
    );
  }
}

export default withStyles(styles)(Titlebar);
