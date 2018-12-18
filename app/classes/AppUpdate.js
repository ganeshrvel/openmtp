'use strict';

import { dialog, BrowserWindow, remote, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import { isConnected } from '../utils/isOnline';
import { log } from '../utils/log';
import { isPackaged } from '../utils/isPackaged';
import { PATHS } from '../utils/paths';
import { ENABLE_BACKGROUND_AUTO_UPDATE } from '../constants';
import { unixTimestampNow } from '../utils/date';

let progressbarWindow = null;
let isFileTransferActiveFlag = false;
let isFileTransferActiveSeekFlag = false;

const createChildWindow = ({ mainWindow }) => {
  try {
    return new BrowserWindow({
      parent: mainWindow,
      modal: true,
      show: true,
      height: 150,
      width: 600,
      title: 'Progress...',
      resizable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      movable: false
    });
  } catch (e) {
    log.error(e, `AppUpdate -> createChildWindow`);
  }
};

const fireProgressbar = ({ mainWindow }) => {
  try {
    if (progressbarWindow) {
      progressbarWindow.focus();
      return null;
    }

    mainWindow.webContents.send('isFileTransferActiveSeek', {
      check: true
    });

    if (!isFileTransferActiveSeekFlag) {
      ipcMain.on('isFileTransferActiveReply', (event, { ...args }) => {
        const { isActive } = args;

        isFileTransferActiveFlag = isActive;
      });
      isFileTransferActiveSeekFlag = true;
    }

    progressbarWindow = createChildWindow({ mainWindow });
    progressbarWindow.loadURL(`${PATHS.loadUrlPath}#progressbarPage`);
    progressbarWindow.on('closed', function() {
      progressbarWindow = null;
    });

    progressbarWindow.onerror = (error, url, line) => {
      log.error(error, `AppUpdate -> progressbarWindow -> onerror`);
    };
  } catch (e) {
    log.error(e, `AppUpdate -> fireProgressbar`);
  }
};

export default class AppUpdate {
  constructor({ mainWindow }) {
    this.autoUpdater = autoUpdater;
    if (!isPackaged) {
      this.autoUpdater.updateConfigPath = PATHS.appUpdateFile;
    }
    this.autoUpdater.autoDownload = ENABLE_BACKGROUND_AUTO_UPDATE;

    this.mainWindow = mainWindow;
    this.domReadyFlag = null;
    this.updateInitFlag = false;
    this.updateForceCheckFlag = false;
    this._errorDialog = {
      timeGenerated: 0,
      title: null,
      message: null
    };
    this.updateIsActive = 0; // 0 = no, 1 = update check in progress, -1 = update in progress
    this.disableAutoUpdateCheck = false;
  }

  init() {
    try {
      if (this.updateInitFlag) {
        return;
      }

      this.autoUpdater.on('error', error => {
        const errorMsg =
          error == null ? 'unknown' : (error.stack || error).toString();

        this.closeActiveUpdates();
        if (progressbarWindow !== null) {
          progressbarWindow.close();
        }

        if (this.isNetworkError(error)) {
          this.spitMessageDialog(
            'Update Error',
            'Oops.. A network error occured. Try again!',
            'error'
          );
          log.doLog(error);

          return null;
        }

        this.spitMessageDialog(
          'Update Error',
          'Oops.. Some error occured while updating the app. Try again!',
          'error'
        );

        log.error(errorMsg, `AppUpdate -> onerror`);
      });

      this.autoUpdater.on('update-available', () => {
        if (progressbarWindow !== null && this.updateIsActive !== -1) {
          progressbarWindow.close();
        }
        
        dialog.showMessageBox(
          {
            type: 'info',
            title: 'Updates Found',
            message: 'New version available. Update the app now?',
            buttons: ['Yes', 'No']
          },
          buttonIndex => {
            switch (buttonIndex) {
              case 0:
                this.closeActiveUpdates(-1);
                this.initDownloadUpdatesProgress();
                this.autoUpdater.downloadUpdate();
                break;
              default:
              case 1:
                if (this.updateIsActive !== -1) {
                  this.closeActiveUpdates();
                }
                break;
            }
          }
        );
      });

      this.autoUpdater.on('download-progress', progress => {
        if (progressbarWindow === null) {
          return null;
        }

        this.setUpdateProgressWindow({ value: progress.percent || 0 });
      });

      this.autoUpdater.on('update-downloaded', () => {
        this.closeActiveUpdates();
        if (progressbarWindow !== null) {
          progressbarWindow.close();
        }

        dialog.showMessageBox(
          {
            title: 'Install Updates',
            message: 'Updates downloaded. Application will quit now...',
            buttons: ['Install and Relaunch']
          },
          buttonIndex => {
            switch (buttonIndex) {
              case 0:
              default:
                this.autoUpdater.quitAndInstall();
                break;
            }
          }
        );
      });

      this.updateInitFlag = true;
    } catch (e) {
      log.error(e, `AppUpdate -> init`);
    }
  }

  checkForUpdates() {
    try {
      isConnected().then(connected => {
        if (!connected) {
          return null;
        }

        if (this.updateIsActive === 1 || this.disableAutoUpdateCheck) {
          return null;
        }

        this.autoUpdater.checkForUpdates();
        this.updateIsActive = 1;
      });
    } catch (e) {
      log.error(e, `AppUpdate -> checkForUpdates`);
    }
  }

  forceCheck() {
    try {
      if (!this.updateForceCheckFlag) {
        this.autoUpdater.on('checking-for-update', () => {
          this.setCheckUpdatesProgress();
        });

        this.autoUpdater.on('update-not-available', () => {
          this.closeActiveUpdates();
          if (progressbarWindow !== null) {
            progressbarWindow.close();
          }
          dialog.showMessageBox(
            {
              title: 'No Updates Found',
              message: 'You have the latest version installed.',
              buttons: ['Close']
            },
            buttonIndex => {
              switch (buttonIndex) {
                case 0:
                default:
                  break;
              }
            }
          );
        });
      }

      if (this.updateIsActive === 1) {
        return null;
      } else if (this.updateIsActive === -1) {
        dialog.showMessageBox(
          {
            title: 'Update in progress',
            message:
              'Another update is in progess. Are you sure want to restart the update?',
            buttons: ['Yes', 'No']
          },
          buttonIndex => {
            switch (buttonIndex) {
              case 0:
                this.autoUpdater.checkForUpdates();
                this.updateIsActive = -1;
                break;
              case 1:
              default:
                break;
            }
          }
        );
        return null;
      }

      this.autoUpdater.checkForUpdates();
      this.updateForceCheckFlag = true;
      this.disableAutoUpdateCheck = true;
      this.updateIsActive = 1;
    } catch (e) {
      log.error(e, `AppUpdate -> forceCheck`);
    }
  }

  setCheckUpdatesProgress() {
    try {
      isConnected().then(connected => {
        if (!connected) {
          this.spitMessageDialog(
            'Checking For Updates',
            'Internet connection is unavailable.'
          );
          return null;
        }

        fireProgressbar({ mainWindow: this.mainWindow });
        this.setTaskBarProgressBar(2);

        progressbarWindow.webContents.once('dom-ready', () => {
          progressbarWindow.webContents.send('progressBarDataCommunication', {
            progressTitle: `Checking For Updates`,
            progressBodyText: `Please wait...`,
            value: 0,
            variant: `indeterminate`
          });
        });
      });
    } catch (e) {
      log.error(e, `AppUpdate -> setCheckUpdatesProgress`);
    }
  }

  initDownloadUpdatesProgress() {
    try {
      isConnected().then(connected => {
        if (!connected) {
          this.spitMessageDialog(
            'Downloading Updates',
            'Internet connection is unavailable.'
          );
          return null;
        }

        fireProgressbar({ mainWindow: this.mainWindow });
        this.domReadyFlag = false;
        this.setUpdateProgressWindow({ value: 0 });
      });
    } catch (e) {
      log.error(e, `AppUpdate -> initDownloadUpdatesProgress`);
    }
  }

  setUpdateProgressWindow({ value = 0 }) {
    try {
      let data = {
        progressTitle: `Downloading Updates`,
        progressBodyText: `Please wait...`,
        value: value,
        variant: `determinate`
      };

      this.setTaskBarProgressBar(value / 100);
      if (this.domReadyFlag) {
        progressbarWindow.webContents.send(
          'progressBarDataCommunication',
          data
        );
        return null;
      }

      progressbarWindow.webContents.once('dom-ready', () => {
        progressbarWindow.webContents.send(
          'progressBarDataCommunication',
          data
        );

        this.domReadyFlag = true;
      });
    } catch (e) {
      log.error(e, `AppUpdate -> setUpdateProgressWindow`);
    }
  }

  setTaskBarProgressBar(value) {
    try {
      if (isFileTransferActiveFlag) {
        return null;
      }

      this.mainWindow.setProgressBar(value);
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

  spitMessageDialog(title, message, type = 'message') {
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
      message
    };

    switch (type) {
      default:
      case 'message':
        dialog.showMessageBox(
          {
            title: title,
            message: message,
            buttons: ['Close']
          },
          buttonIndex => {
            switch (buttonIndex) {
              case 0:
              default:
                break;
            }
          }
        );
        break;
      case 'error':
        dialog.showErrorBox(title, message);
        break;
    }
  }

  closeActiveUpdates(updateIsActive = 0) {
    this.setTaskBarProgressBar(-1);
    this.updateIsActive = updateIsActive;
  }
}
