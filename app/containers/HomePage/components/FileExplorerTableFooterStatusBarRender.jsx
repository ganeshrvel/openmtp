import React, { PureComponent, Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobile, faLaptop } from '@fortawesome/free-solid-svg-icons';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { styles } from '../styles/FileExplorerTableFooterStatusBarRender';
import { getPluralText, niceBytes } from '../../../utils/funcs';
import { DEVICE_TYPE } from '../../../enums';
import { DEVICES_LABEL } from '../../../constants';
import { calculateFolderSize } from '../../../utils/files';

class FileExplorerTableFooterStatusBarRender extends PureComponent {
  getDirectoryListStats = () => {
    const { directoryLists } = this.props;

    let directories = 0;
    let files = 0;
    let totalSize = 0;

    (directoryLists.nodes || []).map((a) => {
      if (a.isFolder) {
        directories += 1;
      } else {
        files += 1;
        totalSize += a.size;
      }

      return a;
    });

    const total = directories + files;

    return { total, directories, files, totalSize };
  };

  getSelectedDirectoryStats = async () => {
    const { directoryLists } = this.props;

    const selected = directoryLists.queue.selected;
    const total = selected.length;
    let totalSize = 0;

    for (const path of selected) {
      const node = directoryLists.nodes.find((n) => n.path === path);
      if (node) {
        if (node.isFolder) {
          totalSize += await calculateFolderSize(node.path);
        } else {
          totalSize += node.size;
        }
      }
    }

    return { total, totalSize };
  };

  RenderDeviceName = () => {
    const { classes: styles, deviceType, mtpDevice } = this.props;

    if (deviceType === DEVICE_TYPE.local) {
      return (
        <Fragment>
          <FontAwesomeIcon icon={faLaptop} title={deviceType} />
          <span className={styles.deviceTypeWrapper}>
            {DEVICES_LABEL[deviceType]}
            <span> - </span>
          </span>
        </Fragment>
      );
    }

    return (
      <Fragment>
        <FontAwesomeIcon icon={faMobile} title={deviceType} />
        <span className={styles.deviceTypeWrapper}>
          {mtpDevice?.isAvailable && mtpDevice?.info?.mtpDeviceInfo
            ? mtpDevice?.info?.mtpDeviceInfo?.Model
            : DEVICES_LABEL[deviceType]}
          <span> - </span>
        </span>
      </Fragment>
    );
  };

  render() {
    const { classes: styles, fileTransferClipboard } = this.props;

    const { directories, files, total, totalSize } = this.getDirectoryListStats();
    const { total: selectedTotal, totalSize: selectedTotalSize } = this.getSelectedDirectoryStats();
    const fileTransferClipboardLength = fileTransferClipboard.queue.length;
    const { RenderDeviceName } = this;

    return (
      <div className={styles.root}>
        <Typography variant="caption" className={styles.bodyWrapper}>
          <RenderDeviceName />

          {selectedTotal > 0 ? (
            <Fragment>{`${selectedTotal} of ${total} selected, ${niceBytes(selectedTotalSize)}`}</Fragment>
          ) : (
            <Fragment>{`${total} ${getPluralText(
              'item',
              total
            )} (${directories} ${getPluralText(
              'directory',
              directories,
              'directories'
            )}, ${files} ${getPluralText('file', files)}, ${niceBytes(totalSize)})`}</Fragment>
          )}
          {`, ${fileTransferClipboardLength} ${getPluralText(
            'item',
            fileTransferClipboardLength
          )} in clipboard`}
        </Typography>
      </div>
    );
  }
}

export default withStyles(styles)(FileExplorerTableFooterStatusBarRender);
