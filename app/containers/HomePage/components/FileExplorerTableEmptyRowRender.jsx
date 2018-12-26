'use strict';

import React, { PureComponent } from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

export default class FileExplorerTableEmptyRowRender extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      styles,
      mtpDevice,
      isMtp,
      currentBrowsePath,
      deviceType,
      directoryLists,
      onContextMenuClick
    } = this.props;

    const _eventTarget = 'emptyRowTarget';

    const tableData = {
      path: currentBrowsePath[deviceType],
      directoryLists: directoryLists[deviceType]
    };

    if (isMtp && !mtpDevice.isAvailable) {
      return (
        <TableRow className={styles.emptyTableRowWrapper}>
          <TableCell colSpan={6} className={styles.tableCell}>
            <Paper style={{ height: `100%` }} elevation={0}>
              <Typography variant="subtitle1" className={styles.noMtp}>
                Android device is either busy or not connected.
              </Typography>
              <ul className={styles.instructions}>
                <li>Quit other Android File transfer applications.</li>
                <li>Unlock your Android device.</li>
                <li>With a USB cable, connect your device to your computer.</li>
                <li>
                  On your device, tap the "Charging this device via USB"
                  notification.
                </li>
                <li>Under "Use USB for" select File Transfer.</li>
                <li>Click Refresh Button above.</li>
                <li>
                  Reconnect the cable and repeat all the above steps if you keep
                  seeing this message.
                </li>
              </ul>
            </Paper>
          </TableCell>
        </TableRow>
      );
    }
    return (
      <TableRow className={styles.emptyTableRowWrapper}>
        <TableCell
          colSpan={6}
          className={styles.tableCell}
          onContextMenu={event =>
            onContextMenuClick(event, {}, { ...tableData }, _eventTarget)
          }
        />
      </TableRow>
    );
  }
}
