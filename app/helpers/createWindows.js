import { BrowserWindow, remote } from 'electron';
import { PATHS } from '../constants/paths';
import { log } from '../utils/log';
import { loadProfileErrorHtml } from '../templates/loadProfileError';
import { APP_TITLE } from '../constants/meta';
import { undefinedOrNull } from '../utils/funcs';
import { PRIVACY_POLICY_PAGE_TITLE } from '../templates/privacyPolicyPage';
import { APP_FEATURES_PAGE_TITLE } from '../templates/appFeaturesPage';
import { KEYBOARD_SHORTCUTS_PAGE_TITLE } from '../templates/keyboardShortcutsPage';
import { getWindowBackgroundColor } from './windowHelper';
import { REPORT_BUGS_PAGE_TITLE } from '../templates/generateErrorReport';

let _nonBootableDeviceWindow = null;
let _reportBugsWindow = null;
let _privacyPolicyWindow = null;
let _appUpdateAvailableWindow = null;
let _appFeaturesWindow = null;
let _keyboardShortcutsWindow = null;

/**
 * Non Bootable Device Window
 */

const nonBootableDeviceCreateWindow = () => {
  return new BrowserWindow({
    title: `${APP_TITLE}`,
    center: true,
    show: false,
    maximizable: false,
    minimizable: false,
    width: 480,
    height: 320,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    backgroundColor: getWindowBackgroundColor(),
  });
};

export const nonBootableDeviceWindow = () => {
  _nonBootableDeviceWindow = nonBootableDeviceCreateWindow();
  _nonBootableDeviceWindow.loadURL(
    `data:text/html;charset=utf-8, ${encodeURI(loadProfileErrorHtml)}`
  );

  _nonBootableDeviceWindow.webContents.on('did-finish-load', () => {
    if (!_nonBootableDeviceWindow) {
      throw new Error(`"nonBootableDeviceWindow" is not defined`);
    }

    if (process.env.START_MINIMIZED) {
      _nonBootableDeviceWindow.minimize();
    } else {
      _nonBootableDeviceWindow.show();
      _nonBootableDeviceWindow.focus();
    }
  });

  _nonBootableDeviceWindow.on('closed', () => {
    _nonBootableDeviceWindow = null;
  });

  return _nonBootableDeviceWindow;
};

/**
 * Report Bugs Window
 */

const reportBugsCreateWindow = (isRenderedPage) => {
  const config = {
    height: 480,
    width: 600,
    show: false,
    resizable: false,
    title: `${APP_TITLE}`,
    minimizable: false,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    backgroundColor: getWindowBackgroundColor(),
  };

  // incoming call from a rendered page
  if (isRenderedPage) {
    const allWindows = remote.BrowserWindow.getAllWindows();
    const existingWindow = loadExistingWindow(
      allWindows,
      REPORT_BUGS_PAGE_TITLE
    );

    return {
      window: existingWindow ?? remote.BrowserWindow(config),
      isExisting: !!existingWindow,
    };
  }

  // incoming call from the main process
  const allWindows = BrowserWindow.getAllWindows();
  const existingWindow = loadExistingWindow(allWindows, REPORT_BUGS_PAGE_TITLE);

  return {
    window: existingWindow ?? BrowserWindow(config),
    isExisting: !!existingWindow,
  };
};

export const reportBugsWindow = (isRenderedPage = false) => {
  try {
    if (_reportBugsWindow) {
      _reportBugsWindow.focus();
      _reportBugsWindow.show();

      return _reportBugsWindow;
    }

    const { window, isExisting } = reportBugsCreateWindow(isRenderedPage);

    if (isExisting) {
      return window;
    }

    _reportBugsWindow = window;
    _reportBugsWindow.loadURL(`${PATHS.loadUrlPath}#reportBugsPage`);
    _reportBugsWindow.webContents.on('did-finish-load', () => {
      _reportBugsWindow.show();
      _reportBugsWindow.focus();
    });

    _reportBugsWindow.onerror = (error) => {
      log.error(error, `createWindows -> reportBugsWindow -> onerror`);
    };

    _reportBugsWindow.on('closed', () => {
      _reportBugsWindow = null;
    });

    return _reportBugsWindow;
  } catch (e) {
    log.error(e, `createWindows -> reportBugsWindow`);
  }
};

/**
 * Privacy Policy Window
 */

const privacyPolicyCreateWindow = (isRenderedPage) => {
  const config = {
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    show: false,
    resizable: true,
    title: `${APP_TITLE}`,
    minimizable: true,
    fullscreenable: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    backgroundColor: getWindowBackgroundColor(),
  };

  // incoming call from a rendered page
  if (isRenderedPage) {
    const allWindows = remote.BrowserWindow.getAllWindows();

    return loadExistingWindow(allWindows, PRIVACY_POLICY_PAGE_TITLE)
      ? null
      : new remote.BrowserWindow(config);
  }

  // incoming call from the main process
  const allWindows = BrowserWindow.getAllWindows();

  return loadExistingWindow(allWindows, PRIVACY_POLICY_PAGE_TITLE)
    ? null
    : new BrowserWindow(config);
};

export const privacyPolicyWindow = (isRenderedPage = false) => {
  try {
    if (_privacyPolicyWindow) {
      _privacyPolicyWindow.focus();
      _privacyPolicyWindow.show();

      return _privacyPolicyWindow;
    }

    // show the existing _privacyPolicyWindow
    const _privacyPolicyWindowTemp = privacyPolicyCreateWindow(isRenderedPage);

    if (!_privacyPolicyWindowTemp) {
      return _privacyPolicyWindow;
    }

    _privacyPolicyWindow = _privacyPolicyWindowTemp;
    _privacyPolicyWindow.loadURL(`${PATHS.loadUrlPath}#privacyPolicyPage`);
    _privacyPolicyWindow.webContents.on('did-finish-load', () => {
      _privacyPolicyWindow.show();
      _privacyPolicyWindow.focus();
    });

    _privacyPolicyWindow.onerror = (error) => {
      log.error(error, `createWindows -> privacyPolicyWindow -> onerror`);
    };

    _privacyPolicyWindow.on('closed', () => {
      _privacyPolicyWindow = null;
    });

    return _privacyPolicyWindow;
  } catch (e) {
    log.error(e, `createWindows -> privacyPolicyWindow`);
  }
};

/**
 * App Update Available Window
 */

const appUpdateAvailableCreateWindow = () => {
  return new BrowserWindow({
    width: 650,
    height: 552,
    show: false,
    resizable: false,
    title: `${APP_TITLE}`,
    minimizable: true,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    backgroundColor: getWindowBackgroundColor(),
  });
};

export const appUpdateAvailableWindow = () => {
  try {
    if (_appUpdateAvailableWindow) {
      _appUpdateAvailableWindow.focus();
      _appUpdateAvailableWindow.show();

      return _appUpdateAvailableWindow;
    }

    // show the existing _appUpdateAvailableWindow
    const _appUpdateAvailableWindowTemp = appUpdateAvailableCreateWindow();

    if (!_appUpdateAvailableWindowTemp) {
      return _appUpdateAvailableWindow;
    }

    _appUpdateAvailableWindow = _appUpdateAvailableWindowTemp;
    _appUpdateAvailableWindow.loadURL(
      `${PATHS.loadUrlPath}#appUpdatePage/updateAvailable`
    );
    _appUpdateAvailableWindow.webContents.on('did-finish-load', () => {
      _appUpdateAvailableWindow.show();
      _appUpdateAvailableWindow.focus();
    });

    _appUpdateAvailableWindow.onerror = (error) => {
      log.error(error, `createWindows -> appUpdateAvailableWindow -> onerror`);
    };

    _appUpdateAvailableWindow.on('closed', () => {
      _appUpdateAvailableWindow = null;
    });

    return _appUpdateAvailableWindow;
  } catch (e) {
    log.error(e, `createWindows -> appUpdateAvailableWindow`);
  }
};

/**
 * App Features Window
 */

const appFeaturesCreateWindow = (isRenderedPage) => {
  const config = {
    width: 800,
    height: 630,
    show: false,
    resizable: false,
    title: `${APP_TITLE}`,
    minimizable: true,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    backgroundColor: getWindowBackgroundColor(),
  };

  // incoming call from a rendered page
  if (isRenderedPage) {
    const allWindows = remote.BrowserWindow.getAllWindows();

    return loadExistingWindow(allWindows, APP_FEATURES_PAGE_TITLE)
      ? null
      : new remote.BrowserWindow(config);
  }

  // incoming call from the main process
  const allWindows = BrowserWindow.getAllWindows();

  return loadExistingWindow(allWindows, APP_FEATURES_PAGE_TITLE)
    ? null
    : new BrowserWindow(config);
};

export const appFeaturesWindow = (isRenderedPage = false) => {
  try {
    if (_appFeaturesWindow) {
      _appFeaturesWindow.focus();
      _appFeaturesWindow.show();

      return _appFeaturesWindow;
    }

    // show the existing _appFeaturesWindow
    const _appFeaturesWindowTemp = appFeaturesCreateWindow(isRenderedPage);

    if (!_appFeaturesWindowTemp) {
      return _appFeaturesWindow;
    }

    _appFeaturesWindow = _appFeaturesWindowTemp;
    _appFeaturesWindow.loadURL(`${PATHS.loadUrlPath}#appFeaturesPage`);
    _appFeaturesWindow.webContents.on('did-finish-load', () => {
      _appFeaturesWindow.show();
      _appFeaturesWindow.focus();
    });

    _appFeaturesWindow.onerror = (error) => {
      log.error(error, `createWindows -> appFeaturesWindow -> onerror`);
    };

    _appFeaturesWindow.on('closed', () => {
      _appFeaturesWindow = null;
    });

    return _appFeaturesWindow;
  } catch (e) {
    log.error(e, `createWindows -> appFeaturesWindow`);
  }
};

/**
 * Keyboard Shortcuts Window
 */

const keyboardShortcutsCreateWindow = (isRenderedPage) => {
  const config = {
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    show: false,
    resizable: true,
    title: `${APP_TITLE}`,
    minimizable: true,
    fullscreenable: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    backgroundColor: getWindowBackgroundColor(),
  };

  // incoming call from a rendered page
  if (isRenderedPage) {
    const allWindows = remote.BrowserWindow.getAllWindows();

    return loadExistingWindow(allWindows, KEYBOARD_SHORTCUTS_PAGE_TITLE)
      ? null
      : new remote.BrowserWindow(config);
  }

  // incoming call from the main process
  const allWindows = BrowserWindow.getAllWindows();

  return loadExistingWindow(allWindows, KEYBOARD_SHORTCUTS_PAGE_TITLE)
    ? null
    : new BrowserWindow(config);
};

export const keyboardShortcutsWindow = (isRenderedPage = false) => {
  try {
    if (_keyboardShortcutsWindow) {
      _keyboardShortcutsWindow.focus();
      _keyboardShortcutsWindow.show();

      return _keyboardShortcutsWindow;
    }

    // show the existing _keyboardShortcutsWindow
    const _keyboardShortcutsWindowTemp = keyboardShortcutsCreateWindow(
      isRenderedPage
    );

    if (!_keyboardShortcutsWindowTemp) {
      return _keyboardShortcutsWindow;
    }

    _keyboardShortcutsWindow = _keyboardShortcutsWindowTemp;
    _keyboardShortcutsWindow.loadURL(
      `${PATHS.loadUrlPath}#keyboardShortcutsPage`
    );
    _keyboardShortcutsWindow.webContents.on('did-finish-load', () => {
      _keyboardShortcutsWindow.show();
      _keyboardShortcutsWindow.focus();
    });

    _keyboardShortcutsWindow.onerror = (error) => {
      log.error(error, `createWindows -> keyboardShortcutsWindow -> onerror`);
    };

    _keyboardShortcutsWindow.on('closed', () => {
      _keyboardShortcutsWindow = null;
    });

    return _keyboardShortcutsWindow;
  } catch (e) {
    log.error(e, `createWindows -> keyboardShortcutsWindow`);
  }
};

// Load an Existing Window
export const loadExistingWindow = (allWindows, title) => {
  if (!undefinedOrNull(allWindows)) {
    for (let i = 0; i < allWindows.length; i += 1) {
      const item = allWindows[i];

      if (item.getTitle().indexOf(title) !== -1) {
        item.focus();
        item.show();

        return item;
      }
    }
  }

  return null;
};
