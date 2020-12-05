import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/Titlebar';
import { toggleWindowSizeOnDoubleClick } from '../../../helpers/titlebarDoubleClick';
import { APP_TITLEBAR_DOM_ID } from '../../../constants/dom';
import { capitalize, isEmpty, niceBytes } from '../../../utils/funcs';
import { getSelectedStorage } from '../../HomePage/actions';

class Titlebar extends PureComponent {
  render() {
    const { classes: styles, mtpDevice, mtpStoragesList, mtpMode } = this.props;

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
        !isEmpty(selectedStorage?.data?.info) ? (
          <span className={styles.deviceInfo}>
            <span className={styles.deviceModel}>
              {`${mtpDevice?.info?.Model} (${selectedStorage?.data?.name}) - `}
            </span>
            {`${niceBytes(
              parseInt(selectedStorage?.data.info.FreeSpaceInBytes ?? 0, 10)
            )} Free of ${niceBytes(
              parseInt(selectedStorage?.data.info.MaxCapability ?? 0, 10)
            )}, ${capitalize(mtpMode)} Mode`}
          </span>
        ) : (
          <span className={styles.deviceInfo}>
            {`${capitalize(mtpMode)} Mode`}
          </span>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(Titlebar);
