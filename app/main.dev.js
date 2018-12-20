'use strict';

import { app, BrowserWindow, ipcMain } from 'electron';
import MenuBuilder from './menu';
import { log } from './utils/log';
import { DEBUG_PROD, IS_DEV, IS_PROD } from './constants/env';
import AppUpdate from './classes/AppUpdate';
import { PATHS } from './utils/paths';
import { settingsStorage } from './utils/storageHelper';
import { AUTO_UPDATE_CHECK_FIREUP_DELAY } from './constants';
import { appEvents } from './utils/eventHandling';

let mainWindow = null;
const isSingleInstance = app.requestSingleInstanceLock();

if (IS_DEV || DEBUG_PROD) {
  require('electron-debug')();
  const path = require('path');
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

if (IS_PROD) {
  process.on('uncaughtException', error => {
    log.error(error, `main.dev -> process -> uncaughtException`);
  });

  appEvents.on('error', error => {
    log.error(error, `main.dev -> appEvents -> error`);
  });
}

const installExtensions = async () => {
  try {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

    return Promise.all(
      extensions.map(name => installer.default(installer[name], forceDownload))
    ).catch(console.error);
  } catch (e) {
    log.error(e, `main.dev -> installExtensions`);
  }
};

if (!isSingleInstance) {
  app.quit();
} else {
  try {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
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
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      await installExtensions();
    }

    mainWindow = new BrowserWindow({
      title: 'OpenMTP',
      center: true,
      show: false,
      minWidth: 854,
      minHeight: 640,
      titleBarStyle: 'hidden'
    });

    mainWindow.loadURL(`${PATHS.loadUrlPath}`);

    mainWindow.webContents.on('did-finish-load', () => {
      if (!mainWindow) {
        throw new Error('"mainWindow" is not defined');
      }
      if (process.env.START_MINIMIZED) {
        mainWindow.minimize();
      } else {
        mainWindow.maximize();
        mainWindow.show();
        mainWindow.focus();
      }
    });

    mainWindow.onerror = (error, url, line) => {
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
    if (process.platform !== 'darwin') {
      app.quit();
    }
  } catch (e) {
    log.error(e, `main.dev -> window-all-closed`);
  }
});

app.on('ready', async () => {
  try {
    await createWindow();
    const autoAppUpdate = new AppUpdate({ mainWindow });
    const menuBuilder = new MenuBuilder({ mainWindow, autoAppUpdate });

    menuBuilder.buildMenu();
    autoAppUpdate.init();

    //todo: case delete settings.json and run the app. it will throw settings.json not found error. fix it
    //  by using ipc
    //  or move boot to main and send an even to ipc ( not recommended).
    // this is for logs
    const autoUpdateCheck = settingsStorage.getItems(['enableAutoUpdateCheck']);
    if (autoUpdateCheck.enableAutoUpdateCheck !== false) {
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
