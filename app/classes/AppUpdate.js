'use strict';

import { dialog, BrowserWindow, remote, ipcRenderer } from 'electron';
import { autoUpdater } from 'electron-updater';
import { isConnected } from '../utils/isOnline';
import { log } from '../utils/log';
import { isPackaged } from '../utils/isPackaged';
import { PATHS } from '../utils/paths';

let progressbarWindow = null;
let domReadyFlag = false;

const createChildWindow = () => {
  return new BrowserWindow({
    parent: `top`,
    modal: true,
    height: 150,
    width: 600,
    title: 'Progress...',
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    closable: false,
    movable: false
  });
};

const fireProgressbar = () => {
  if (progressbarWindow) {
    progressbarWindow.focus();
    return null;
  }

  progressbarWindow = createChildWindow();
  progressbarWindow.loadURL(`${PATHS.loadUrlPath}#progressbar`);
  progressbarWindow.on('closed', function() {
    progressbarWindow = null;
  });
};

export default class AppUpdate {
  constructor({ parentWindow }) {
    this.autoUpdater = autoUpdater;
    if (!isPackaged) {
      this.autoUpdater.updateConfigPath = PATHS.appUpdateFile;
    }
    this.autoUpdater.autoDownload = false;

    this.updateInitFlag = false;
    this.updateForceCheckFlag = false;
  }

  init() {
    if (this.updateInitFlag) {
      return;
    }

    this.autoUpdater.on('error', error => {
      const errorMsg =
        error == null ? 'unknown' : (error.stack || error).toString();
      if (progressbarWindow !== null) {
        progressbarWindow.close();
        progressbarWindow.destroy();
      }

      dialog.showErrorBox(`Error: ${errorMsg}`);
      log.doLog(error);
    });

    this.autoUpdater.on('update-available', () => {
      if (progressbarWindow !== null) {
        progressbarWindow.close();
        progressbarWindow.destroy();
      }

      dialog.showMessageBox(
        {
          type: 'info',
          title: 'Updates Found',
          message: 'New update found. Update now?',
          buttons: ['Yes', 'No']
        },
        buttonIndex => {
          switch (buttonIndex) {
            case 0:
              this.initDownloadUpdatesProgress();
              this.autoUpdater.downloadUpdate();
              break;
            default:
            case 1:
              return;
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
      if (progressbarWindow !== null) {
        progressbarWindow.close();
        progressbarWindow.destroy();
      }

      dialog.showMessageBox(
        {
          title: 'Install Updates',
          message: 'Updates downloaded. Application will be quit for update...',
          buttons: ['Install']
        },
        buttonIndex => {
          switch (buttonIndex) {
            case 0:
            default:
              autoUpdater.quitAndInstall();
              break;
          }
        }
      );
    });

    this.updateInitFlag = true;

    try {
    } catch (e) {
      log.error(e, `AppUpdate -> init`);
    }
  }

  checkForUpdates() {
    this.autoUpdater.checkForUpdates();
  }

  forceCheck() {
    if (!this.updateForceCheckFlag) {
      this.autoUpdater.on('checking-for-update', () => {
        this.setCheckUpdatesProgress();
      });

      this.autoUpdater.on('update-not-available', () => {
        if (progressbarWindow !== null) {
          progressbarWindow.close();
          progressbarWindow.destroy();
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

    this.autoUpdater.checkForUpdates();
    this.updateForceCheckFlag = true;
    try {
    } catch (e) {
      log.error(e, `AppUpdate -> forceCheck`);
    }
  }

  setCheckUpdatesProgress() {
    isConnected().then(connected => {
      if (!connected) {
        dialog.showMessageBox(
          {
            title: 'Checking For Updates',
            message: 'Internet connection is unavailable.',
            buttons: ['Close']
          },
          buttonIndex => {
            switch (buttonIndex) {
              case 0:
              default:
                return;
                break;
            }
          }
        );
        return null;
      }

      fireProgressbar();
      progressbarWindow.webContents.once('dom-ready', () => {
        progressbarWindow.webContents.send('progressbarCommunicate', {
          progressTitlebar: `Checking For Updates`,
          progressTitle: `Please wait...`,
          value: 0,
          variant: `indeterminate`
        });
      });
    });
  }

  initDownloadUpdatesProgress() {
    isConnected().then(connected => {
      if (!connected) {
        dialog.showMessageBox(
          {
            title: 'Downloading Updates',
            message: 'Internet connection is unavailable.',
            buttons: ['Close']
          },
          buttonIndex => {
            switch (buttonIndex) {
              case 0:
              default:
                return;
                break;
            }
          }
        );
        return null;
      }

      fireProgressbar();
      domReadyFlag = false;
      this.setUpdateProgressWindow({ value: 0 });
    });
  }

  setUpdateProgressWindow({ value = 0 }) {
    let data = {
      progressTitlebar: `Downloading Updates`,
      progressTitle: `Please wait...`,
      value: value,
      variant: `determinate`
    };

    if (domReadyFlag) {
      progressbarWindow.webContents.send('progressbarCommunicate', data);
      return null;
    }

    progressbarWindow.webContents.once('dom-ready', () => {
      progressbarWindow.webContents.send('progressbarCommunicate', data);

      domReadyFlag = true;
    });
  }
}
