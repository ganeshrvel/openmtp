'use strict';

/* eslint global-require: off */

import { app, BrowserWindow, ipcMain } from 'electron';
import electronIs from 'electron-is';
import MenuBuilder from './menu';
import { log } from './utils/log';
import { DEBUG_PROD, IS_DEV, IS_PROD } from './constants/env';
import AppUpdate from './classes/AppUpdate';
import { PATHS } from './utils/paths';
import { settingsStorage } from './utils/storageHelper';
import { AUTO_UPDATE_CHECK_FIREUP_DELAY } from './constants';
import { appEvents } from './utils/eventHandling';
import { bootLoader } from './utils/bootHelper';
import { nonBootableDeviceWindow } from './utils/createWindows';
import { APP_TITLE } from './constants/meta';
import { isPackaged } from './utils/isPackaged';

const isSingleInstance = app.requestSingleInstanceLock();
const isDeviceBootable = bootTheDevice();
const isMas = electronIs.mas();
let mainWindow = null;

if (IS_PROD) {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (IS_DEV || DEBUG_PROD) {
  require('electron-debug')();
}

async function bootTheDevice() {
  try {
    // For an existing installation
    if (bootLoader.quickVerify()) {
      return true;
    }

    // For a fresh installation
    await bootLoader.init();
    return await bootLoader.verify();
  } catch (e) {
    throw new Error(e);
  }
}

/**
 * Checks whether device is ready to boot or not.
 * Here profile files are created if not found.
 */
if (!isDeviceBootable) {
  app.on('ready', async () => {
    try {
      nonBootableDeviceWindow();
    } catch (e) {
      throw new Error(e);
    }
  });

  app.on('window-all-closed', () => {
    try {
      app.quit();
    } catch (e) {
      throw new Error(e);
    }
  });
} else {
  if (IS_PROD) {
    process.on('uncaughtException', (error) => {
      log.error(error, `main.dev -> process -> uncaughtException`);
    });

    appEvents.on('error', (error) => {
      log.error(error, `main.dev -> appEvents -> error`);
    });

    ipcMain.removeAllListeners('ELECTRON_BROWSER_WINDOW_ALERT');
    ipcMain.on('ELECTRON_BROWSER_WINDOW_ALERT', (event, message, title) => {
      ipcMain.error(
        message,
        `main.dev -> ipcMain -> on ELECTRON_BROWSER_WINDOW_ALERT -> ${title}`
      );
      // eslint-disable-next-line no-param-reassign
      event.returnValue = 0;
    });
  }

  const installExtensions = async () => {
    try {
      const installer = require('electron-devtools-installer');
      const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
      const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

      return Promise.all(
        extensions.map((name) =>
          installer.default(installer[name], forceDownload)
        )
      ).catch(console.error);
    } catch (e) {
      log.error(e, `main.dev -> installExtensions`);
    }
  };

  if (!isSingleInstance) {
    app.quit();
  } else {
    try {
      app.on('second-instance', () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) {
            mainWindow.restore();
          }
          mainWindow.focus();
        }
      });

      app.on('ready', () => {});
    } catch (e) {
      log.error(e, `main.dev -> second-instance`);
    }
  }

  const createWindow = async () => {
    try {
      if (IS_DEV || DEBUG_PROD) {
        await installExtensions();
      }

      mainWindow = new BrowserWindow({
        title: `${APP_TITLE}`,
        center: true,
        show: false,
        minWidth: 854,
        minHeight: 640,
        titleBarStyle: 'hidden',
        webPreferences: {
          nodeIntegration: true,
        },
      });

      mainWindow.loadURL(`${PATHS.loadUrlPath}`);

      mainWindow.webContents.on('did-finish-load', () => {
        if (!mainWindow) {
          throw new Error(`"mainWindow" is not defined`);
        }
        if (process.env.START_MINIMIZED) {
          mainWindow.minimize();
        } else {
          mainWindow.maximize();
          mainWindow.show();
          mainWindow.focus();
        }
      });

      mainWindow.onerror = (error) => {
        log.error(error, `main.dev -> mainWindow -> onerror`);
      };

      mainWindow.on('closed', () => {
        mainWindow = null;
      });
    } catch (e) {
      log.error(e, `main.dev -> createWindow`);
    }
  };

  app.on('window-all-closed', () => {
    try {
      if (process.platform === 'darwin') {
        return;
      }

      app.quit();
    } catch (e) {
      log.error(e, `main.dev -> window-all-closed`);
    }
  });

  app.on('ready', async () => {
    try {
      await createWindow();

      let appUpdaterEnable = true;
      if (isPackaged && process.platform === 'darwin') {
        appUpdaterEnable = !isMas && app.isInApplicationsFolder();
      }

      const autoUpdateCheckSettings = settingsStorage.getItems([
        'enableBackgroundAutoUpdate',
        'enableAutoUpdateCheck',
        'enablePrereleaseUpdates',
      ]);

      const autoUpdateCheck =
        autoUpdateCheckSettings.enableAutoUpdateCheck !== false;

      const autoAppUpdate = new AppUpdate({
        autoUpdateCheck,
        autoDownload:
          autoUpdateCheckSettings.enableBackgroundAutoUpdate !== false,
        allowPrerelease:
          autoUpdateCheckSettings.enablePrereleaseUpdates === true,
      });
      autoAppUpdate.init();

      const menuBuilder = new MenuBuilder({
        mainWindow,
        autoAppUpdate,
        appUpdaterEnable,
      });
      menuBuilder.buildMenu();

      if (autoUpdateCheck && appUpdaterEnable) {
        setTimeout(() => {
          autoAppUpdate.checkForUpdates();
        }, AUTO_UPDATE_CHECK_FIREUP_DELAY);
      }
    } catch (e) {
      log.error(e, `main.dev -> ready`);
    }
  });

  app.on('activate', async () => {
    try {
      if (mainWindow === null) {
        await createWindow();
      }
    } catch (e) {
      log.error(e, `main.dev -> activate`);
    }
  });

  app.on('before-quit', () => (app.quitting = true)); // eslint-disable-line no-return-assign
}
