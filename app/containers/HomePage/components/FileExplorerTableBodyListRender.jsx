'use strict';

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import FolderIcon from '@material-ui/icons/Folder';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import classNames from 'classnames';
import { niceBytes, springTruncate } from '../../../utils/funcs';
import { FILE_EXPLORER_TABLE_TRUNCATE_MAX_CHARS } from '../../../constants';
import { styles } from '../styles/FileExplorerTableBodyListRender';

class FileExplorerTableBodyListRender extends PureComponent {
  render() {
    const {
      classes: styles,
      isSelected,
      item,
      deviceType,
      _eventTarget,
      tableData,
      hideColList,
      onContextMenuClick,
      onTableClick,
      onTableDoubleClick,
    } = this.props;

    const fileName = springTruncate(
      item.name,
      FILE_EXPLORER_TABLE_TRUNCATE_MAX_CHARS
    );

    return (
      <TableRow
        hover
        role="checkbox"
        aria-checked={isSelected}
        tabIndex={-1}
        selected={isSelected}
        className={classNames({
          [styles.tableRowSelected]: isSelected,
        })}
      >
        <TableCell
          padding="none"
          className={`${styles.tableCell} checkboxCell`}
          onContextMenu={(event) =>
            onContextMenuClick(
              event,
              { ...item },
              { ...tableData },
              _eventTarget
            )
          }
        >
          <Checkbox
            checked={isSelected}
            onClick={(event) => onTableClick(item.path, deviceType, event)}
          />
        </TableCell>
        {hideColList.indexOf('name') < 0 && (
          <TableCell
            padding="default"
            onClick={(event) => onTableClick(item.path, deviceType, event)}
            className={`${styles.tableCell} nameCell`}
            onContextMenu={(event) =>
              onContextMenuClick(
                event,
                { ...item },
                { ...tableData },
                _eventTarget
              )
            }
            onDoubleClick={(event) =>
              onTableDoubleClick(item, deviceType, event)
            }
          >
            {item.isFolder ? (
              <Tooltip title="Folder">
                <FolderIcon
                  className={classNames(styles.tableCellIcon, `isFolder`)}
                  fontSize="small"
                />
              </Tooltip>
            ) : (
              <Tooltip title="File">
                <InsertDriveFileIcon
                  className={classNames(styles.tableCellIcon, `isFile`)}
                  fontSize="small"
                />
              </Tooltip>
            )}
            &nbsp;&nbsp;
            {fileName.isTruncated ? (
              <Tooltip title={fileName.text}>
                <div className={styles.truncate}>{fileName.truncatedText}</div>
              </Tooltip>
            ) : (
              fileName.text
            )}
          </TableCell>
        )}
        {hideColList.indexOf('size') < 0 && (
          <TableCell
            padding="none"
            onClick={(event) => onTableClick(item.path, deviceType, event)}
            className={`${styles.tableCell} sizeCell`}
            onContextMenu={(event) =>
              onContextMenuClick(
                event,
                { ...item },
                { ...tableData },
                _eventTarget
              )
            }
            onDoubleClick={(event) =>
              onTableDoubleClick(item, deviceType, event)
            }
          >
            {item.isFolder ? `--` : `${niceBytes(item.size)}`}
          </TableCell>
        )}
        {hideColList.indexOf('dateAdded') < 0 && (
          <TableCell
            padding="none"
            onClick={(event) => onTableClick(item.path, deviceType, event)}
            className={`${styles.tableCell} dateAddedCell`}
            onContextMenu={(event) =>
              onContextMenuClick(
                event,
                { ...item },
                { ...tableData },
                _eventTarget
              )
            }
            onDoubleClick={(event) =>
              onTableDoubleClick(item, deviceType, event)
            }
          >
            {item.dateAdded}
          </TableCell>
        )}
      </TableRow>
    );
  }
}

export default withStyles(styles)(FileExplorerTableBodyListRender);
