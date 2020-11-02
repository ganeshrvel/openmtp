'use strict';

import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import FolderIcon from '@material-ui/icons/Folder';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import { springTruncate } from '../../../utils/funcs';
import { FILE_EXPLORER_GRID_TRUNCATE_MAX_CHARS } from '../../../constants';
import { styles } from '../styles/FileExplorerTableBodyGridRender';

class FileExplorerTableBodyGridRender extends PureComponent {
  render() {
    const {
      classes: styles,
      isSelected,
      item,
      deviceType,
      _eventTarget,
      tableData,
      onContextMenuClick,
      onTableClick,
      onTableDoubleClick,
    } = this.props;

    const fileName = springTruncate(
      item.name,
      FILE_EXPLORER_GRID_TRUNCATE_MAX_CHARS
    );

    return (
      <div
        className={classNames(styles.itemWrapper, {
          [styles.itemSelected]: isSelected,
        })}
        onDoubleClick={(event) => onTableDoubleClick(item, deviceType, event)}
        onContextMenu={(event) =>
          onContextMenuClick(event, { ...item }, { ...tableData }, _eventTarget)
        }
      >
        <label>
          <Checkbox
            className={styles.itemCheckBox}
            checked={isSelected}
            onClick={(event) =>
              onTableClick(item.path, deviceType, event, true, true)
            }
          />
          {item.isFolder ? (
            <FolderIcon
              color="secondary"
              className={classNames(styles.itemIcon, `isFolder`)}
              fontSize="small"
              onContextMenu={(event) =>
                onContextMenuClick(
                  event,
                  { ...item },
                  { ...tableData },
                  _eventTarget
                )
              }
            />
          ) : (
            <InsertDriveFileIcon
              className={classNames(styles.itemIcon, `isFile`)}
              fontSize="small"
              onContextMenu={(event) =>
                onContextMenuClick(
                  event,
                  { ...item },
                  { ...tableData },
                  _eventTarget
                )
              }
            />
          )}
          <div className={styles.itemFileNameWrapper}>
            <Typography
              variant="caption"
              className={styles.itemFileName}
              onContextMenu={(event) =>
                onContextMenuClick(
                  event,
                  { ...item },
                  { ...tableData },
                  _eventTarget
                )
              }
            >
              {fileName.isTruncated ? (
                <Tooltip title={fileName.text}>
                  <div className={styles.truncate}>
                    {fileName.truncatedText}
                  </div>
                </Tooltip>
              ) : (
                fileName.text
              )}
            </Typography>
          </div>
        </label>
      </div>
    );
  }
}

export default withStyles(styles)(FileExplorerTableBodyGridRender);
