/* eslint global-require: off */

import './services/sentry/index';

import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron';
import electronIs from 'electron-is';
import usbDetect from 'usb-detection';
import process from 'process';
import MenuBuilder from './menu';
import { log } from './utils/log';
import { DEBUG_PROD, ENV_FLAVOR, IS_DEV, IS_PROD } from './constants/env';
import AppUpdate from './classes/AppUpdate';
import { PATHS } from './constants/paths';
import { settingsStorage } from './helpers/storageHelper';
import { AUTO_UPDATE_CHECK_FIREUP_DELAY } from './constants';
import { appEvents } from './utils/eventHandling';
import { bootLoader } from './helpers/bootHelper';
import { nonBootableDeviceWindow } from './helpers/createWindows';
import { APP_TITLE } from './constants/meta';
import { isPackaged } from './utils/isPackaged';
import { getWindowBackgroundColor } from './helpers/windowHelper';
import {
  APP_THEME_MODE_TYPE,
  DEVICE_TYPE,
  MTP_MODE,
  USB_HOTPLUG_EVENTS,
} from './enums';
import fileExplorerController from './data/file-explorer/controllers/FileExplorerController';
import { getEnablePrereleaseUpdatesSetting } from './helpers/settings';
import { getRemoteWindow } from './helpers/remoteWindowHelpers';
import { IpcEvents } from './services/ipc-events/IpcEventType';
import IpcEventService from './services/ipc-events/IpcEventHandler';
import { isKalamModeSupported } from './helpers/binaries';
import { fileExistsSync } from './helpers/fileOps';

const remote = getRemoteWindow();

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

function fixSettings() {
  const { settingsFile } = PATHS;

  if (!fileExistsSync(settingsFile)) {
    return;
  }

  const settings = settingsStorage.getItems([
    'mtpMode',
    'wasForcedToToggleMtpModeForMinOsRequirement',
  ]);

  if (!settings) {
    return;
  }

  const shouldEnableKalamMode = isKalamModeSupported();

  // Since we have now officially retired the support for `Kalam` Kernel on macOS 10.13 (OS X El High Sierra) and lower. Only the "Legacy" MTP mode will continue working on the outdated machines.
  // Here we toggle the MTP mode to legacy mode for the older macOSes and will mark it as a forceful toggle.
  // And once the user upgrades their OS and the [wasForcedToToggleMtpModeForMinOsRequirement] was true then we toggle the user back to Kalam MTP mode.
  if (settings.wasForcedToToggleMtpModeForMinOsRequirement === true) {
    if (shouldEnableKalamMode && settings.mtpMode === MTP_MODE.legacy) {
      settingsStorage.setItems({
        mtpMode: MTP_MODE.kalam,
        wasForcedToToggleMtpModeForMinOsRequirement: false,
      });
    }
  } else if (!shouldEnableKalamMode && settings.mtpMode === MTP_MODE.kalam) {
    settingsStorage.setItems({
      mtpMode: MTP_MODE.legacy,
      wasForcedToToggleMtpModeForMinOsRequirement: true,
    });
  }
}

async function installExtensions() {
  const {
    default: installExtension,
    REDUX_DEVTOOLS,
    REACT_DEVELOPER_TOOLS,
  } = await import('electron-devtools-installer');

  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS];

  return installExtension(extensions, {
    forceDownload,
  }).catch((err) =>
    log.error(
      `An extension error occurred: ${err}`,
      `main.dev -> installExtensions`
    )
  );
}

async function createWindow() {
  try {
    if (ENV_FLAVOR.allowDevelopmentEnvironment) {
      await installExtensions();
    }

    mainWindow = new BrowserWindow({
      title: `${APP_TITLE}`,
      center: true,
      show: false,
      minWidth: 880,
      minHeight: 640,
      titleBarStyle: 'hidden',
      webPreferences: {
        enableRemoteModule: true,
        nodeIntegration: true,
        contextIsolation: false,
      },
      backgroundColor: getWindowBackgroundColor(),
    });

    remote.enable(mainWindow.webContents);

    mainWindow?.loadURL(`${PATHS.loadUrlPath}`);

    mainWindow?.webContents?.on('did-finish-load', () => {
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
  fixSettings();

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

  IpcEventService.shared.start();

  app
    .whenReady()
    .then(async () => {
      // eslint-disable-next-line promise/always-return
      try {
        await createWindow();

        let appUpdaterEnable = true;

        if (isPackaged && process.platform === 'darwin') {
          appUpdaterEnable = !isMas && app.isInApplicationsFolder();
        }

        const autoUpdateCheckSettings = settingsStorage.getItems([
          'enableBackgroundAutoUpdate',
          'enableAutoUpdateCheck',
        ]);

        const autoUpdateCheck =
          autoUpdateCheckSettings.enableAutoUpdateCheck !== false;
        const isPrereleaseUpdatesEnabled = getEnablePrereleaseUpdatesSetting();

        const autoAppUpdate = new AppUpdate({
          autoUpdateCheck,
          autoDownload:
            autoUpdateCheckSettings.enableBackgroundAutoUpdate !== false,
          allowPrerelease: isPrereleaseUpdatesEnabled === true,
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

        // send attach and detach events to the renderer
        usbDetect.startMonitoring();

        usbDetect.on('add', (device) => {
          if (!mainWindow) {
            return;
          }

          mainWindow?.webContents?.send(IpcEvents.USB_HOTPLUG, {
            device: JSON.stringify(device),
            eventName: USB_HOTPLUG_EVENTS.attach,
          });
        });

        usbDetect.on('remove', (device) => {
          if (!mainWindow) {
            return;
          }

          mainWindow?.webContents?.send(IpcEvents.USB_HOTPLUG, {
            device: JSON.stringify(device),
            eventName: USB_HOTPLUG_EVENTS.detach,
          });
        });

        process.stdout.on('error', (err) => {
          if (err.code === 'EPIPE') {
            process.exit(0);
          }
        });
      } catch (e) {
        log.error(e, `main.dev -> whenReady`);
      }

      app.on('activate', async () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        try {
          if (mainWindow === null) {
            await createWindow();
          }
        } catch (e) {
          log.error(e, `main.dev -> activate`);
        }
      });
    })
    .catch((e) => {
      log.error(e, `main.dev -> whenReady`);
    });

  app.on('before-quit', async () => {
    fileExplorerController
      .dispose({
        deviceType: DEVICE_TYPE.mtp,
      })
      .catch((e) => {
        log.error(e, `main.dev -> before-quit`);
      });

    usbDetect.stopMonitoring();

    app.quitting = true;
  });

  nativeTheme.on('updated', () => {
    const setting = settingsStorage.getItems(['appThemeMode']);

    // if the app theme is 'auto' and if the os theme has changed
    // then refresh the app theme
    if (setting.appThemeMode !== APP_THEME_MODE_TYPE.auto) {
      return;
    }

    if (!mainWindow) {
      return;
    }

    mainWindow?.webContents?.send('nativeThemeUpdated', {
      shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
    });
  });
}
