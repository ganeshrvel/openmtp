import { BrowserWindow, dialog, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import { isConnected } from '../utils/isOnline';
import { log } from '../utils/log';
import { isPackaged } from '../utils/isPackaged';
import { PATHS } from '../constants/paths';
import { unixTimestampNow } from '../utils/date';
import { undefinedOrNull } from '../utils/funcs';
import {
  getMainWindowMainProcess,
  getWindowBackgroundColor,
} from '../helpers/windowHelper';
import { appUpdateAvailableWindow } from '../helpers/createWindows';
import { UPDATER_STATUS } from '../enums/appUpdater';
import { getRemoteWindow } from '../helpers/remoteWindowHelpers';

let progressbarWindow = null;
let isFileTransferActiveFlag = false;
let mainWindow = null;

const remote = getRemoteWindow();

remote.initialize();

const createChildWindow = () => {
  try {
    return new BrowserWindow({
      parent: mainWindow,
      modal: true,
      show: false,
      height: 150,
      width: 600,
      title: 'Progress...',
      resizable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      movable: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
      backgroundColor: getWindowBackgroundColor(),
    });
  } catch (e) {
    log.error(e, `AppUpdate -> createChildWindow`);
  }
};

const fireProgressbar = () => {
  try {
    if (progressbarWindow) {
      progressbarWindow.show();
      progressbarWindow.focus();

      return null;
    }

    mainWindow.webContents.send('isFileTransferActiveSeek', {
      check: true,
    });

    ipcMain.once('isFileTransferActiveReply', (event, { ...args }) => {
      const { isActive } = args;

      isFileTransferActiveFlag = isActive;
    });

    progressbarWindow = createChildWindow();
    remote.enable(progressbarWindow.webContents);

    progressbarWindow.loadURL(
      `${PATHS.loadUrlPath}#appUpdatePage/updateProgress`
    );

    progressbarWindow.webContents.on('did-finish-load', () => {
      progressbarWindow.show();
      progressbarWindow.focus();
    });

    progressbarWindow.on('closed', () => {
      progressbarWindow = null;
    });

    progressbarWindow.onerror = (error) => {
      log.error(error, `AppUpdate -> progressbarWindow -> onerror`);
    };
  } catch (e) {
    log.error(e, `AppUpdate -> fireProgressbar`);
  }
};

export default class AppUpdate {
  constructor({ autoUpdateCheck, autoDownload, allowPrerelease }) {
    this.autoUpdater = autoUpdater;
    if (!isPackaged) {
      this.autoUpdater.updateConfigPath = PATHS.devAppUpdateFile;
    }

    this.autoUpdater.autoDownload = autoUpdateCheck && autoDownload;
    this.autoUpdater.allowPrerelease = allowPrerelease;
    this.autoUpdater.autoInstallOnAppQuit = true;
    this.autoUpdateCheck = autoUpdateCheck;

    this.progressbarWindowDomReadyFlag = null;
    this.updateInitFlag = false;
    this.updateForceCheckFlag = false;
    this._errorDialog = {
      timeGenerated: 0,
      title: null,
      message: null,
    };

    this.updateStatus = UPDATER_STATUS.inactive;
    this.disableAutoUpdateCheck = false;
  }

  init() {
    try {
      if (this.updateInitFlag) {
        return;
      }

      this.autoUpdater.on('error', (error) => {
        if (progressbarWindow !== null) {
          progressbarWindow.close();
        }

        this.closeActiveUpdates();

        if (this.isNetworkError(error)) {
          this.spitMessageDialog(
            'Update Error',
            'Oops.. A network error occured. Try again!',
            'error'
          );

          log.doLog(error, `AppUpdate -> onerror -> isNetworkError`);

          return null;
        }

        this.spitMessageDialog(
          'Update Error',
          'Oops.. Some error occured while updating the app. Try again!',
          'error'
        );

        log.error(error, `AppUpdate -> onerror`);
      });

      this.autoUpdater.on('update-available', (info) => {
        if (
          progressbarWindow !== null &&
          this.updateStatus !== UPDATER_STATUS.updateInProgress
        ) {
          progressbarWindow.close();
        }

        // When auto background update download and auto update check are active prevent other ways (manual) of download handling.
        if (this.autoUpdater.autoDownload && this.autoUpdateCheck) {
          this.closeActiveUpdates(-1);

          return;
        }

        const _appUpdateAvailableWindow = appUpdateAvailableWindow();

        _appUpdateAvailableWindow.on('close', () => {
          if (this.updateStatus !== UPDATER_STATUS.updateInProgress) {
            this.closeActiveUpdates();
          }
        });

        _appUpdateAvailableWindow.webContents.once('dom-ready', () => {
          _appUpdateAvailableWindow.webContents.send(
            'appUpdatesUpdateAvailableCommunication',
            info
          );
        });

        ipcMain.once('appUpdatesUpdateAvailableReply', (event, { ...args }) => {
          const { confirm } = args;

          if (!confirm) {
            if (this.updateStatus !== UPDATER_STATUS.updateInProgress) {
              this.closeActiveUpdates();
            }

            return null;
          }

          if (progressbarWindow !== null) {
            progressbarWindow.close();
          }

          this.closeActiveUpdates(-1);
          this.initDownloadUpdatesProgress();

          // this is to prevent race condition
          if (!this.autoUpdater.autoDownload) {
            this.autoUpdater.downloadUpdate();
          }
        });
      });

      this.autoUpdater.on('download-progress', (progress) => {
        if (progressbarWindow === null) {
          return null;
        }

        this.setUpdateProgressWindow({ value: progress.percent || 0 });
      });

      this.autoUpdater.on('update-downloaded', async () => {
        this.closeActiveUpdates();
        if (progressbarWindow !== null) {
          progressbarWindow.close();
        }

        const { response: buttonIndex } = await dialog.showMessageBox({
          title: 'Install Updates',
          message: 'Updates downloaded. Install and relaunch?',
          buttons: ['Install Now', 'Install on Quit'],
        });

        switch (buttonIndex) {
          case 0:
            this.autoUpdater.quitAndInstall();
            break;
          case 1:
          default:
            // autoInstallOnAppQuit will trigger the update later
            break;
        }
      });

      this.updateInitFlag = true;
    } catch (e) {
      log.error(e, `AppUpdate -> init`);
    }
  }

  checkForUpdates() {
    try {
      this.setMainWindow();

      if (!mainWindow) {
        return;
      }

      isConnected()
        .then((connected) => {
          if (!connected) {
            return null;
          }

          if (
            this.updateStatus === UPDATER_STATUS.checkInProgress ||
            this.disableAutoUpdateCheck
          ) {
            return null;
          }

          this.autoUpdater.on('update-not-available', () => {
            this.updateStatus = UPDATER_STATUS.inactive;
          });

          this.autoUpdater.checkForUpdates();

          this.updateStatus = UPDATER_STATUS.checkInProgress;

          return true;
        })
        .catch(() => {});
    } catch (e) {
      log.error(e, `AppUpdate -> checkForUpdates`);
    }
  }

  async forceCheck() {
    try {
      this.setMainWindow();

      if (!mainWindow) {
        return;
      }

      if (
        !this.updateForceCheckFlag &&
        this.updateStatus !== UPDATER_STATUS.checkInProgress
      ) {
        this.autoUpdater.on('checking-for-update', () => {
          this.setCheckUpdatesProgress();
        });

        this.autoUpdater.on('update-not-available', async () => {
          // an another 'update-not-available' event is registered at checkForUpdates() as well
          this.closeActiveUpdates();

          if (progressbarWindow !== null) {
            progressbarWindow.close();
          }

          const { response: buttonIndex } = await dialog.showMessageBox({
            title: 'No Updates Found',
            message: 'You have the latest version installed.',
            buttons: ['Close'],
          });

          switch (buttonIndex) {
            case 0:
            default:
              break;
          }
        });
      }

      if (this.updateStatus === UPDATER_STATUS.checkInProgress) {
        return null;
      }

      if (this.updateStatus === UPDATER_STATUS.updateInProgress) {
        const { response: buttonIndex } = await dialog.showMessageBox({
          title: 'Update in progress',
          message:
            'Another update is in progess. Are you sure want to restart the update?',
          buttons: ['Cancel', 'Yes'],
        });

        switch (buttonIndex) {
          case 1:
            this.autoUpdater.checkForUpdates();
            this.updateStatus = UPDATER_STATUS.updateInProgress;
            break;
          case 0:
          default:
            break;
        }

        return null;
      }

      this.autoUpdater.checkForUpdates();
      this.updateForceCheckFlag = true;
      this.disableAutoUpdateCheck = true;
      this.updateStatus = UPDATER_STATUS.checkInProgress;
    } catch (e) {
      log.error(e, `AppUpdate -> forceCheck`);
    }
  }

  setCheckUpdatesProgress() {
    try {
      isConnected()
        .then((connected) => {
          if (!connected) {
            this.spitMessageDialog(
              'Checking For Updates',
              'Internet connection is unavailable.'
            );

            return null;
          }

          fireProgressbar();
          this.setTaskBarProgressBar(2);

          progressbarWindow.webContents.once('dom-ready', () => {
            progressbarWindow.webContents.send(
              'appUpdatesProgressBarCommunication',
              {
                progressTitle: `Checking For Updates`,
                progressBodyText: `Please wait...`,
                value: 0,
                variant: `indeterminate`,
              }
            );
          });

          return true;
        })
        .catch(() => {});
    } catch (e) {
      log.error(e, `AppUpdate -> setCheckUpdatesProgress`);
    }
  }

  initDownloadUpdatesProgress() {
    try {
      isConnected()
        .then((connected) => {
          if (!connected) {
            this.spitMessageDialog(
              'Downloading Updates',
              'Internet connection is unavailable.'
            );

            return null;
          }

          fireProgressbar();
          this.progressbarWindowDomReadyFlag = false;
          this.setUpdateProgressWindow({ value: 0 });

          return true;
        })
        .catch(() => {});
    } catch (e) {
      log.error(e, `AppUpdate -> initDownloadUpdatesProgress`);
    }
  }

  setUpdateProgressWindow({ value = 0 }) {
    try {
      const data = {
        progressTitle: `Downloading Updates`,
        progressBodyText: `Please wait...`,
        value,
        variant: `determinate`,
      };

      this.setTaskBarProgressBar(value / 100);
      if (this.progressbarWindowDomReadyFlag) {
        progressbarWindow.webContents.send(
          'appUpdatesProgressBarCommunication',
          data
        );

        return null;
      }

      progressbarWindow.webContents.once('dom-ready', () => {
        progressbarWindow.webContents.send(
          'appUpdatesProgressBarCommunication',
          data
        );

        this.progressbarWindowDomReadyFlag = true;
      });
    } catch (e) {
      log.error(e, `AppUpdate -> setUpdateProgressWindow`);
    }
  }

  setMainWindow() {
    const _mainWindow = getMainWindowMainProcess();

    if (undefinedOrNull(_mainWindow)) {
      return null;
    }

    mainWindow = _mainWindow;
  }

  setTaskBarProgressBar(value) {
    try {
      if (isFileTransferActiveFlag) {
        return null;
      }

      mainWindow.setProgressBar(value);
    } catch (e) {
      log.error(e, `AppUpdate -> setTaskBarProgressBar`);
    }
  }

  isNetworkError(errorObj) {
    return (
      errorObj.message === 'net::ERR_INTERNET_DISCONNECTED' ||
      errorObj.message === 'net::ERR_PROXY_CONNECTION_FAILED' ||
      errorObj.message === 'net::ERR_CONNECTION_RESET' ||
      errorObj.message === 'net::ERR_CONNECTION_CLOSE' ||
      errorObj.message === 'net::ERR_NAME_NOT_RESOLVED' ||
      errorObj.message === 'net::ERR_CONNECTION_TIMED_OUT'
    );
  }

  async spitMessageDialog(title, message, type = 'message') {
    const { timeGenerated: _timeGenerated } = this._errorDialog;
    const delayTime = 1000;

    if (
      _timeGenerated !== 0 &&
      _timeGenerated - unixTimestampNow() < delayTime
    ) {
      return null;
    }

    this._errorDialog = {
      timeGenerated: unixTimestampNow(),
      title,
      message,
    };

    switch (type) {
      case 'error':
        dialog.showErrorBox(title, message);
        break;

      case 'message':
      default:
        // eslint-disable-next-line no-case-declarations
        const { response: buttonIndex } = await dialog.showMessageBox({
          title,
          message,
          buttons: ['Close'],
        });

        switch (buttonIndex) {
          case 0:
          default:
            break;
        }

        break;
    }
  }

  closeActiveUpdates(updateStatus = UPDATER_STATUS.inactive) {
    this.setTaskBarProgressBar(-1);
    this.updateStatus = updateStatus;
  }
}
