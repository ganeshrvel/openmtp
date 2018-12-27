'use strict';

import React, { PureComponent } from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import FolderIcon from '@material-ui/icons/Folder';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import classNames from 'classnames';
import { niceBytes, springTruncate } from '../../../utils/funcs';

export default class FileExplorerTableRowsRender extends PureComponent {
  constructor(props) {
    super(props);
  }

  _handleContextMenuClick(event, { ...item }, { ...tableData }, _eventTarget) {
    const { onContextMenuClick } = this.props;

    onContextMenuClick(event, { ...item }, { ...tableData }, _eventTarget);
  }

  _handleTableClick(item, deviceType, event) {
    const { onTableClick } = this.props;

    onTableClick(item, deviceType, event);
  }

  _handleTableDoubleClick({ ...args }) {
    const { onTableDoubleClick } = this.props;

    onTableDoubleClick({ ...args });
  }

  render() {
    const {
      isSelected,
      item,
      styles,
      deviceType,
      hideColList,
      currentBrowsePath,
      directoryLists
    } = this.props;

    const _eventTarget = 'tableCellTarget';

    const tableData = {
      path: currentBrowsePath[deviceType],
      directoryLists: directoryLists[deviceType]
    };

    const truncateMinimumChars = 37;

    const fileName = springTruncate(item.name, truncateMinimumChars);

    const doubleClickMenuObj = event => {
      return {
        path: item.path,
        deviceType: deviceType,
        isFolder: item.isFolder,
        event: event
      };
    };

    return (
      <TableRow
        hover={true}
        role="checkbox"
        aria-checked={isSelected}
        tabIndex={-1}
        selected={isSelected}
        className={classNames({
          [styles.tableRowSelected]: isSelected
        })}
      >
        <TableCell
          padding="none"
          className={`${styles.tableCell} checkboxCell`}
          onContextMenu={event =>
            this._handleContextMenuClick(
              event,
              { ...item },
              { ...tableData },
              _eventTarget
            )
          }
        >
          <Checkbox
            checked={isSelected}
            onClick={event =>
              this._handleTableClick(item.path, deviceType, event)
            }
          />
        </TableCell>
        {hideColList.indexOf('name') < 0 && (
          <TableCell
            padding="default"
            onClick={event =>
              this._handleTableClick(item.path, deviceType, event)
            }
            className={`${styles.tableCell} nameCell`}
            onContextMenu={event =>
              this._handleContextMenuClick(
                event,
                { ...item },
                { ...tableData },
                _eventTarget
              )
            }
            onDoubleClick={event =>
              this._handleTableDoubleClick(doubleClickMenuObj(event))
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
            onClick={event =>
              this._handleTableClick(item.path, deviceType, event)
            }
            className={`${styles.tableCell} sizeCell`}
            onContextMenu={event =>
              this._handleContextMenuClick(
                event,
                { ...item },
                { ...tableData },
                _eventTarget
              )
            }
            onDoubleClick={event =>
              this._handleTableDoubleClick(doubleClickMenuObj(event))
            }
          >
            {item.isFolder ? `--` : `${niceBytes(item.size)}`}
          </TableCell>
        )}
        {hideColList.indexOf('dateAdded') < 0 && (
          <TableCell
            padding="none"
            onClick={event =>
              this._handleTableClick(item.path, deviceType, event)
            }
            className={`${styles.tableCell} dateAddedCell`}
            onContextMenu={event =>
              this._handleContextMenuClick(
                event,
                { ...item },
                { ...tableData },
                _eventTarget
              )
            }
            onDoubleClick={event =>
              this._handleTableDoubleClick(doubleClickMenuObj(event))
            }
          >
            {item.dateAdded}
          </TableCell>
        )}
      </TableRow>
    );
  }
}
