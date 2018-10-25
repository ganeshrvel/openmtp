'use strict';

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 */
import { app, BrowserWindow } from 'electron';
import MenuBuilder from './menu';
import { log } from './utils/log';
import { IS_PROD, DEBUG_PROD, IS_DEV } from './constants/env';

let mainWindow = null;
const isSingleInstance = app.requestSingleInstanceLock();

if (IS_PROD) {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (IS_DEV || DEBUG_PROD) {
  require('electron-debug')();
  const path = require('path');
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
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

    mainWindow.loadURL(`file://${__dirname}/app.html`);

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

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();
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
