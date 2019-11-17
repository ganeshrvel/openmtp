

import React, { PureComponent, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { styles } from '../styles/FileExplorerTableFooterStatusBarRender';
import { getPluralText } from '../../../utils/funcs';

class FileExplorerTableFooterStatusBarRender extends PureComponent {
  getDirectoryListStats = () => {
    const { directoryLists } = this.props;

    let directories = 0;
    let files = 0;

    (directoryLists.nodes || []).map(a => {
      if (a.isFolder) {
        directories += 1;
      } else {
        files += 1;
      }

      return a;
    });

    const total = directories + files;

    return { total, directories, files };
  };

  getSelectedDirectoryStats = () => {
    const { directoryLists } = this.props;

    const total = directoryLists.queue.selected.length;

    return { total };
  };

  render() {
    const { classes: styles, fileTransferClipboard } = this.props;

    const { directories, files, total } = this.getDirectoryListStats();
    const { total: selectedTotal } = this.getSelectedDirectoryStats();
    const fileTransferClipboardLength = fileTransferClipboard.queue.length;

    return (
      <div className={styles.root}>
        <Typography variant="caption" className={styles.bodyWrapper}>
          {selectedTotal > 0 ? (
            <Fragment>{`${selectedTotal} of ${total} selected`}</Fragment>
          ) : (
            <Fragment>{`${total} ${getPluralText(
              'item',
              total
            )} (${directories} ${getPluralText(
              'directory',
              directories,
              'directories'
            )}, ${files} ${getPluralText('file', files)})`}</Fragment>
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
