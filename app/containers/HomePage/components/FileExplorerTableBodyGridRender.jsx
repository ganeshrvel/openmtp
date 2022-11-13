import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
// eslint-disable-next-line import/no-relative-packages
import prettyFileIcons from '../../../vendors/pretty-file-icons';
import { springTruncate } from '../../../utils/funcs';
import { FILE_EXPLORER_GRID_TRUNCATE_MAX_CHARS } from '../../../constants';
import { styles } from '../styles/FileExplorerTableBodyGridRender';
import { imgsrc } from '../../../utils/imgsrc';

class FileExplorerTableBodyGridRender extends PureComponent {
  RenderFileIcon = () => {
    const {
      classes: styles,
      item,
      _eventTarget,
      tableData,
      onContextMenuClick,
    } = this.props;

    const fileIcon = prettyFileIcons.getIcon(item.name, 'svg');

    return (
      <div className={styles.fileTypeIconWrapper}>
        <img
          src={imgsrc(`file-types/${fileIcon}`)}
          alt={item.name}
          className={classNames(styles.fileTypeIcon)}
          onContextMenu={(event) =>
            onContextMenuClick(
              event,
              { ...item },
              { ...tableData },
              _eventTarget
            )
          }
        />
      </div>
    );
  };

  RenderFolderIcon = () => {
    const {
      classes: styles,
      item,
      _eventTarget,
      tableData,
      onContextMenuClick,
    } = this.props;

    return (
      <div className={styles.fileTypeIconWrapper}>
        <img
          src={imgsrc(`FileExplorer/folder-blue.svg`)}
          alt={item.name}
          className={classNames(styles.fileTypeIcon)}
          onContextMenu={(event) =>
            onContextMenuClick(
              event,
              { ...item },
              { ...tableData },
              _eventTarget
            )
          }
        />
      </div>
    );
  };

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
    const { RenderFileIcon, RenderFolderIcon } = this;

    const fileName = springTruncate(
      item.name,
      FILE_EXPLORER_GRID_TRUNCATE_MAX_CHARS
    );

    return (
      <div
        draggable="true"
        className={classNames(styles.itemWrapper, {
          [styles.itemSelected]: isSelected,
        })}
        onDoubleClick={(event) => onTableDoubleClick(item, deviceType, event)}
        onContextMenu={(event) =>
          onContextMenuClick(event, { ...item }, { ...tableData }, _eventTarget)
        }
        onDragStart={(event) => {
          if (!isSelected) {
            onTableClick(item.path, deviceType, event, true, true);
          }
        }}
      >
        <label>
          <Checkbox
            className={styles.itemCheckBox}
            checked={isSelected}
            onClick={(event) =>
              onTableClick(item.path, deviceType, event, true, true)
            }
          />
          {item.isFolder ? <RenderFolderIcon /> : <RenderFileIcon />}
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
