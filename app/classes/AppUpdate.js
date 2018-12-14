'use strict';

import { dialog, BrowserWindow, remote } from 'electron';
import { autoUpdater } from 'electron-updater';
import { isConnected } from '../utils/isOnline';
import ElectronProgressbar from 'electron-progressbar';
import { log } from '../utils/log';
import { IS_DEV } from '../constants/env';
import { PATHS } from '../utils/paths';

export default class AppUpdate {
  constructor() {
    this.autoUpdater = autoUpdater;
    this.autoUpdater.updateConfigPath = PATHS.appUpdateFile;
    this.autoUpdater.autoDownload = false;

    this.forceCheckProgress = null;
    this.downloadProgress = null;
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
      this.forceCheckProgress.setCompleted();

      dialog.showErrorBox(`Error: ${errorMsg}`);
      log.doLog(error);
    });

    this.autoUpdater.on('update-available', () => {
      this.forceCheckProgress.setCompleted();

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
              this.autoUpdater.downloadUpdate();
              break;
            default:
            case 1:
              this.setDownloadUpdatesProgress();
              return;
              break;
          }
        }
      );
    });

    this.autoUpdater.on('download-progress', (ev, progress) => {
      if (this.downloadProgress.isCompleted()) {
        return null;
      }

      this.downloadProgress.value = progress.percent;
    });

    this.autoUpdater.on('update-downloaded', () => {
      this.downloadProgress.setCompleted();

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
        this.forceCheckProgress.setCompleted();
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

      this.forceCheckProgress = new ElectronProgressbar({
        title: 'Checking For Updates',
        text: 'Please wait...',
        detail: ''
      });
    });
  }

  setDownloadUpdatesProgress() {
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

      this.downloadProgress = new ElectronProgressbar({
        indeterminate: false,
        title: 'Downloading Updates',
        text: 'Please wait...',
        detail: ''
      });
    });
  }
}
