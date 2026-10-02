import React, { Fragment, PureComponent } from 'react';
import pathUtil from 'path';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { connect } from 'react-redux';
import { withReducer } from '../../../store/reducers/withReducer';
import reducers from '../reducers';
import { makeAdbDevice } from '../selectors';
import fileExplorerController from '../../../data/file-explorer/controllers/FileExplorerController';
import { DEVICE_TYPE, FILE_TRANSFER_DIRECTION } from '../../../enums';
import { ANDROID_STORAGE_ROOT } from '../../../data/adb/AdbTransport';
import { getRemoteWindow } from '../../../helpers/remoteWindowHelpers';
import { fileExistsSync } from '../../../helpers/fileOps';
import { Confirm as ConfirmDialog } from '../../../components/DialogBox';
import { niceBytes } from '../../../utils/funcs';

const remote = getRemoteWindow();

/** Format bytes/second as a human-readable string. */
const formatRate = (bytesPerSec) => {
  if (!bytesPerSec || bytesPerSec <= 0) return '—';

  return `${niceBytes(bytesPerSec)}/s`;
};

class AdbFileExplorerPane extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      path: ANDROID_STORAGE_ROOT,
      entries: [],
      selected: null,
      error: null,
      /** null | 'disconnect' — categorises the error so UI can offer reconnect */
      errorType: null,
      isLoading: false,

      /**
       * null when idle; when a transfer is active:
       * { operationId: string|null, direction: string, progress: object|null }
       */
      transfer: null,

      /** Overwrite confirm dialog state */
      overwriteConfirmOpen: false,
      pendingTransferArgs: null,
    };
  }

  async componentDidMount() {
    const { adbDevice } = this.props;

    if (adbDevice.selected) {
      await fileExplorerController.initialize({
        deviceType: DEVICE_TYPE.adb,
        serial: adbDevice.selected.serial,
      });
      this.listDirectory();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { adbDevice } = this.props;
    const nextDevice = nextProps.adbDevice;

    if (nextDevice.selected?.serial !== adbDevice.selected?.serial) {
      this.setState(
        {
          open: !!nextDevice.selected,
          path: ANDROID_STORAGE_ROOT,
          error: null,
          errorType: null,
          transfer: null,
          entries: [],
          selected: null,
        },
        async () => {
          if (nextDevice.selected) {
            await fileExplorerController.initialize({
              deviceType: DEVICE_TYPE.adb,
              serial: nextDevice.selected.serial,
            });
            this.listDirectory();
          }
        }
      );
    }
  }

  // Guard: reject start when a transfer is already running (queue lock).
  _isTransferBusy = () => {
    const { transfer } = this.state;

    return !!transfer;
  };

  listDirectory = async (targetPath = null) => {
    const { path: statePath } = this.state;
    const path = targetPath || statePath;

    this.setState({ isLoading: true, error: null, errorType: null });

    const result = await fileExplorerController.listFiles({
      deviceType: DEVICE_TYPE.adb,
      filePath: path,
      ignoreHidden: false,
      storageId: null,
    });

    if (result.error) {
      const isDisconnect =
        /no devices|device offline|connection refused|unauthorized/i.test(
          result.error
        );

      this.setState({
        isLoading: false,
        error: result.error,
        errorType: isDisconnect ? 'disconnect' : null,
      });

      return;
    }

    this.setState({
      path,
      entries: result.data || [],
      selected: null,
      error: null,
      errorType: null,
      isLoading: false,
    });
  };

  folderUp = () => {
    const { path } = this.state;

    if (path === ANDROID_STORAGE_ROOT) return;
    const parent = path.replace(/\/$/, '').replace(/\/[^/]+$/, '');

    this.listDirectory(parent || ANDROID_STORAGE_ROOT);
  };

  createDirectory = async () => {
    // eslint-disable-next-line no-alert
    const name = window.prompt('New folder name');

    if (!name || name.includes('/')) return;
    const { path } = this.state;
    const result = await fileExplorerController.makeDirectory({
      deviceType: DEVICE_TYPE.adb,
      filePath: `${path}/${name}`,
      storageId: null,
    });

    if (result.error) this.setState({ error: result.error });
    else this.listDirectory();
  };

  renameSelected = async () => {
    const { selected } = this.state;

    if (!selected) return;
    // eslint-disable-next-line no-alert
    const name = window.prompt('New name', selected.name);

    if (!name || name.includes('/')) return;
    const result = await fileExplorerController.renameFile({
      deviceType: DEVICE_TYPE.adb,
      filePath: selected.path,
      newFilename: name,
      storageId: null,
    });

    if (result.error) this.setState({ error: result.error });
    else this.listDirectory();
  };

  deleteSelected = async () => {
    const { selected } = this.state;

    if (!selected) return;

    // Use browser confirm as a lightweight modal — the Confirm dialog
    // component requires a trigger toggle; a simple confirm here keeps things
    // lean for a destructive single-item action.
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Permanently delete "${selected.name}"?`)) return;
    const result = await fileExplorerController.deleteFiles({
      deviceType: DEVICE_TYPE.adb,
      fileList: [selected.path],
      storageId: null,
    });

    if (result.error) this.setState({ error: result.error });
    else this.listDirectory();
  };

  // ─── Transfer flow ────────────────────────────────────────────────────────

  /** Pick source files/destination dir via system dialog and start transfer. */
  startTransfer = async (direction) => {
    if (this._isTransferBusy()) return;

    const { path, selected } = this.state;
    const isUpload = direction === FILE_TRANSFER_DIRECTION.upload;

    if (!isUpload && (!selected || selected.isFolder)) return;

    const dialogResult = await remote.dialog.showOpenDialog(
      remote.getCurrentWindow(),
      isUpload
        ? { properties: ['openFile', 'multiSelections'] }
        : { properties: ['openDirectory', 'createDirectory'] }
    );

    if (dialogResult.canceled || dialogResult.filePaths.length < 1) return;

    const sources = isUpload ? dialogResult.filePaths : [selected.path];
    const destination = isUpload ? path : dialogResult.filePaths[0];

    // ── Overwrite check ───────────────────────────────────────────────────
    let fileExists = false;

    if (isUpload) {
      fileExists = await fileExplorerController.filesExist({
        deviceType: DEVICE_TYPE.adb,
        fileList: sources.map(
          (source) => `${destination}/${pathUtil.basename(source)}`
        ),
        storageId: null,
      });
    } else {
      fileExists = fileExistsSync(
        pathUtil.join(destination, pathUtil.posix.basename(selected.path))
      );
    }

    if (fileExists) {
      // Use the standardised Confirm dialog matching MTP UX.
      this.setState({
        overwriteConfirmOpen: true,
        pendingTransferArgs: { sources, destination, direction },
      });

      return;
    }

    this._executeTransfer({ sources, destination, direction });
  };

  /** Called by the Confirm overwrite dialog. */
  _handleOverwriteConfirm = (confirmed) => {
    const { pendingTransferArgs } = this.state;

    this.setState({ overwriteConfirmOpen: false, pendingTransferArgs: null });
    if (!confirmed) return;
    this._executeTransfer(pendingTransferArgs);
  };

  /** Actually starts the ADB transfer. Enforces transfer-queue lock. */
  _executeTransfer = ({ sources, destination, direction }) => {
    if (this._isTransferBusy()) return;

    const onError = ({ error }) => {
      const isDisconnect =
        error &&
        /no devices|device offline|connection refused|unauthorized|cancelled/i.test(
          error
        );

      this.setState({
        error: isDisconnect
          ? 'Transfer failed: device disconnected or went offline. Refresh to reconnect.'
          : error,
        errorType: isDisconnect ? 'disconnect' : null,
        transfer: null,
      });
    };

    const onCompleted = () => {
      this.setState({ transfer: null, error: null, errorType: null });
      if (direction === FILE_TRANSFER_DIRECTION.upload) this.listDirectory();
    };

    const onProgress = (progress) => {
      this.setState(({ transfer }) => ({
        transfer: transfer ? { ...transfer, progress } : null,
      }));
    };

    this.setState(
      {
        transfer: { operationId: null, direction, progress: null },
        error: null,
        errorType: null,
      },
      () => {
        const operationId = fileExplorerController.transferFiles({
          deviceType: DEVICE_TYPE.adb,
          destination,
          fileList: sources,
          direction,
          storageId: null,
          onPreprocess: () => {},
          onProgress,
          onError,
          onCompleted,
        });

        // transferFiles returns a promise that resolves to the operationId.
        Promise.resolve(operationId)
          .then((id) => {
            this.setState(({ transfer }) => ({
              transfer: transfer ? { ...transfer, operationId: id } : null,
            }));

            return id;
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.error(
              err,
              'AdbFileExplorerPane -> transferFiles resolve error'
            );
          });
      }
    );
  };

  cancelTransfer = () => {
    const { transfer } = this.state;

    if (transfer?.operationId) {
      fileExplorerController.cancelAdbTransfer(transfer.operationId);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  _renderProgress() {
    const { transfer } = this.state;

    if (!transfer) return null;

    const { progress } = transfer;
    const hasProgress = !!progress;

    const activePercent = hasProgress
      ? Math.min(100, Math.floor(progress.activeFileProgress || 0))
      : 0;
    const totalPercent = hasProgress
      ? Math.min(100, Math.floor(progress.totalFileProgress || 0))
      : 0;
    const bytesRate = hasProgress ? progress.speed * 1000 * 1000 : 0; // speed is in MB/s
    const rateLabel = hasProgress ? formatRate(bytesRate) : '';
    const currentFile = hasProgress
      ? pathUtil.basename(progress.currentFile || '')
      : '';
    const bytesSent = hasProgress
      ? `${niceBytes(progress.activeFileSizeSent || 0)} / ${niceBytes(
          progress.activeFileSize || 0
        )}`
      : '';

    return (
      <div style={{ margin: '12px 0' }}>
        <Typography
          variant="body2"
          style={{ fontWeight: 600, marginBottom: 4 }}
        >
          {hasProgress
            ? `${
                transfer.direction === FILE_TRANSFER_DIRECTION.upload
                  ? 'Uploading'
                  : 'Downloading'
              }: ${currentFile}`
            : 'Preparing transfer…'}
        </Typography>

        {hasProgress && (
          <>
            <LinearProgress
              variant="determinate"
              value={activePercent}
              style={{ marginBottom: 4, height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption" color="textSecondary">
              {`File: ${activePercent}% · ${bytesSent} @ ${rateLabel}`}
            </Typography>
            {progress.totalFiles > 1 && (
              <>
                <LinearProgress
                  variant="determinate"
                  value={totalPercent}
                  color="secondary"
                  style={{
                    marginTop: 6,
                    marginBottom: 4,
                    height: 4,
                    borderRadius: 3,
                  }}
                />
                <Typography variant="caption" color="textSecondary">
                  {`Overall: ${progress.filesSent + 1} of ${
                    progress.totalFiles
                  } files · ${totalPercent}%`}
                </Typography>
              </>
            )}
            <Typography
              variant="caption"
              color="textSecondary"
              style={{ display: 'block' }}
            >
              {`Elapsed: ${progress.elapsedTime}`}
            </Typography>
          </>
        )}

        {!hasProgress && (
          <LinearProgress
            variant="indeterminate"
            style={{ marginBottom: 4, height: 6, borderRadius: 3 }}
          />
        )}

        <Button
          size="small"
          color="secondary"
          variant="outlined"
          onClick={this.cancelTransfer}
          style={{ marginTop: 8 }}
        >
          Cancel Transfer
        </Button>
      </div>
    );
  }

  render() {
    const { adbDevice } = this.props;
    const {
      open,
      path,
      entries,
      selected,
      error,
      errorType,
      isLoading,
      transfer,
      overwriteConfirmOpen,
    } = this.state;

    const connectionLabel = adbDevice.selected
      ? `${
          adbDevice.selected.transport === 'wifi' ? 'Wi-Fi' : 'USB'
        } \u00b7 ADB`
      : 'ADB';

    return (
      <Fragment>
        {adbDevice.selected && (
          <Button
            color="primary"
            variant="outlined"
            style={{ position: 'fixed', right: 16, top: 104, zIndex: 1300 }}
            onClick={() => this.setState({ open: true }, this.listDirectory)}
          >
            Browse Android Storage
          </Button>
        )}

        {/* ── Standardised overwrite confirm — matches MTP UX ── */}
        <ConfirmDialog
          fullWidthDialog
          maxWidthDialog="xs"
          bodyText="Replace and merge the existing items?"
          trigger={overwriteConfirmOpen}
          onClickHandler={this._handleOverwriteConfirm}
        />

        <Dialog
          open={open}
          onClose={() => this.setState({ open: false })}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            {adbDevice.selected?.model || 'Android Device'}
            {' \u2014 '}
            {connectionLabel}
            {' \u2014 Internal Storage'}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {path}
            </Typography>

            {/* ── Toolbar buttons ── */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 4,
                marginBottom: 8,
              }}
            >
              <Button
                size="small"
                onClick={this.folderUp}
                disabled={
                  path === ANDROID_STORAGE_ROOT || isLoading || !!transfer
                }
              >
                Folder Up
              </Button>
              <Button
                size="small"
                onClick={() => this.listDirectory()}
                disabled={isLoading || !!transfer}
              >
                Refresh
              </Button>
              <Button
                size="small"
                onClick={this.createDirectory}
                disabled={isLoading || !!transfer}
              >
                New Folder
              </Button>
              <Button
                size="small"
                onClick={this.renameSelected}
                disabled={!selected || isLoading || !!transfer}
              >
                Rename
              </Button>
              <Button
                size="small"
                onClick={this.deleteSelected}
                disabled={!selected || isLoading || !!transfer}
              >
                Delete
              </Button>
              <Button
                size="small"
                color="primary"
                variant="contained"
                onClick={() =>
                  this.startTransfer(FILE_TRANSFER_DIRECTION.upload)
                }
                disabled={!!transfer || isLoading}
              >
                Upload
              </Button>
              <Button
                size="small"
                color="primary"
                variant="contained"
                onClick={() =>
                  this.startTransfer(FILE_TRANSFER_DIRECTION.download)
                }
                disabled={
                  !selected || selected.isFolder || !!transfer || isLoading
                }
              >
                Download
              </Button>
            </div>

            {/* ── Transfer progress ── */}
            {this._renderProgress()}

            {/* ── Error / disconnect state ── */}
            {error && (
              <div
                style={{
                  marginBottom: 8,
                  padding: '8px 12px',
                  borderRadius: 4,
                  background: 'rgba(244,67,54,0.08)',
                  border: '1px solid rgba(244,67,54,0.25)',
                }}
              >
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
                {errorType === 'disconnect' && (
                  <Button
                    size="small"
                    color="primary"
                    style={{ marginTop: 6 }}
                    onClick={() => this.listDirectory()}
                  >
                    Refresh / Reconnect
                  </Button>
                )}
              </div>
            )}

            {/* ── File list ── */}
            {isLoading && !transfer && (
              <LinearProgress style={{ marginBottom: 8 }} />
            )}
            <List dense>
              {entries.map((entry) => (
                <ListItem
                  button
                  key={entry.path}
                  selected={selected?.path === entry.path}
                  onClick={() => this.setState({ selected: entry })}
                  onDoubleClick={() =>
                    entry.isFolder &&
                    !transfer &&
                    this.listDirectory(entry.path)
                  }
                >
                  <ListItemText
                    primary={`${entry.isFolder ? '\uD83D\uDCC1 ' : ''}${
                      entry.name
                    }`}
                    secondary={
                      entry.isFolder
                        ? 'Folder'
                        : `${niceBytes(entry.size || 0)} · ${
                            entry.dateAdded || ''
                          }`
                    }
                  />
                </ListItem>
              ))}
              {!isLoading && !error && entries.length === 0 && (
                <ListItem>
                  <ListItemText
                    secondary="This folder is empty."
                    primaryTypographyProps={{ style: { display: 'none' } }}
                  />
                </ListItem>
              )}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ open: false })}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({ adbDevice: makeAdbDevice(state) });

export default withReducer(
  'Home',
  reducers
)(connect(mapStateToProps)(AdbFileExplorerPane));
