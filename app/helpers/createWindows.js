import { BrowserWindow } from 'electron';
import { PATHS } from '../constants/paths';
import { log } from '../utils/log';
import { loadProfileErrorHtml } from '../templates/loadProfileError';
import { APP_TITLE } from '../constants/meta';
import { undefinedOrNull } from '../utils/funcs';
import { PRIVACY_POLICY_PAGE_TITLE } from '../templates/privacyPolicyPage';
import {
  FAQS_PAGE_TITLE,
  HELP_PHONE_IS_NOT_CONNECTING,
} from '../templates/helpFaqsPage';
import { APP_FEATURES_PAGE_TITLE } from '../templates/appFeaturesPage';
import { KEYBOARD_SHORTCUTS_PAGE_TITLE } from '../templates/keyboardShortcutsPage';
import { getWindowBackgroundColor } from './windowHelper';
import { REPORT_BUGS_PAGE_TITLE } from '../templates/generateErrorReport';
import { getRemoteWindow } from './remoteWindowHelpers';

const remote = getRemoteWindow();

let _nonBootableDeviceWindow = null;
let _reportBugsWindow = null;
let _privacyPolicyWindow = null;
let _faqsWindow = null;
let _helpPhoneIsNotConnectingWindow = null;
let _appUpdateAvailableWindow = null;
let _appFeaturesWindow = null;
let _keyboardShortcutsWindow = null;

/**
 * Enable remote main since it has been explicitly disabled by electron.
 */
function enableRemoteMainForRenderer({ existingWindow, windowConfig }) {
  let windowObj = existingWindow;

  if (!windowObj) {
    windowObj = new remote.BrowserWindow(windowConfig);

    const remoteMain = remote.require('@electron/remote/main');

    remoteMain.enable(windowObj.webContents);
  }

  return windowObj;
}

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
      contextIsolation: false,
      enableRemoteModule: true,
    },
    backgroundColor: getWindowBackgroundColor(),
  });
};

export const nonBootableDeviceWindow = () => {
  _nonBootableDeviceWindow = nonBootableDeviceCreateWindow();
  remote.enable(_nonBootableDeviceWindow.webContents);

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
      contextIsolation: false,
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
      windowObj: enableRemoteMainForRenderer({
        existingWindow,
        windowConfig: config,
      }),
      isExisting: !!existingWindow,
    };
  }

  // incoming call from the main process
  const allWindows = BrowserWindow.getAllWindows();
  const existingWindow = loadExistingWindow(allWindows, REPORT_BUGS_PAGE_TITLE);

  const bWindow = new BrowserWindow(config);

  remote.enable(bWindow.webContents);

  return {
    windowObj: existingWindow ?? bWindow,
    isExisting: !!existingWindow,
  };
};

export const reportBugsWindow = (isRenderedPage = false, focus = true) => {
  try {
    if (_reportBugsWindow) {
      if (focus) {
        _reportBugsWindow.focus();
        _reportBugsWindow.show();
      }

      return _reportBugsWindow;
    }

    const { windowObj, isExisting } = reportBugsCreateWindow(isRenderedPage);

    // return the existing windowObj object
    if (isExisting) {
      return windowObj;
    }

    _reportBugsWindow = windowObj;
    _reportBugsWindow.loadURL(`${PATHS.loadUrlPath}#reportBugsPage`);
    _reportBugsWindow.webContents.on('did-finish-load', () => {
      if (focus) {
        _reportBugsWindow.show();
        _reportBugsWindow.focus();
      }
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

const privacyPolicyCreateWindow = (isRenderedPage = false) => {
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
      contextIsolation: false,
      enableRemoteModule: true,
    },
    backgroundColor: getWindowBackgroundColor(),
  };

  // incoming call from a rendered page
  if (isRenderedPage) {
    const allWindows = remote.BrowserWindow.getAllWindows();
    const existingWindow = loadExistingWindow(
      allWindows,
      PRIVACY_POLICY_PAGE_TITLE
    );

    return {
      windowObj: enableRemoteMainForRenderer({
        existingWindow,
        windowConfig: config,
      }),
      isExisting: !!existingWindow,
    };
  }

  // incoming call from the main process
  const allWindows = BrowserWindow.getAllWindows();
  const existingWindow = loadExistingWindow(
    allWindows,
    PRIVACY_POLICY_PAGE_TITLE
  );

  const bWindow = new BrowserWindow(config);

  remote.enable(bWindow.webContents);

  return {
    windowObj: existingWindow ?? bWindow,
    isExisting: !!existingWindow,
  };
};

export const privacyPolicyWindow = (isRenderedPage = false, focus = true) => {
  try {
    if (_privacyPolicyWindow) {
      if (focus) {
        _privacyPolicyWindow.focus();
        _privacyPolicyWindow.show();
      }

      return _privacyPolicyWindow;
    }

    // show the existing _privacyPolicyWindow
    const { windowObj, isExisting } = privacyPolicyCreateWindow(isRenderedPage);

    // return the existing windowObj object
    if (isExisting) {
      return windowObj;
    }

    _privacyPolicyWindow = windowObj;
    _privacyPolicyWindow.loadURL(`${PATHS.loadUrlPath}#privacyPolicyPage`);
    _privacyPolicyWindow.webContents.on('did-finish-load', () => {
      if (focus) {
        _privacyPolicyWindow.show();
        _privacyPolicyWindow.focus();
      }
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
      contextIsolation: false,
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

    remote.enable(_appUpdateAvailableWindowTemp.webContents);

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
      contextIsolation: false,
      enableRemoteModule: true,
    },
    backgroundColor: getWindowBackgroundColor(),
  };

  // incoming call from a rendered page
  if (isRenderedPage) {
    const allWindows = remote.BrowserWindow.getAllWindows();
    const existingWindow = loadExistingWindow(
      allWindows,
      APP_FEATURES_PAGE_TITLE
    );

    return {
      windowObj: enableRemoteMainForRenderer({
        existingWindow,
        windowConfig: config,
      }),
      isExisting: !!existingWindow,
    };
  }

  // incoming call from the main process
  const allWindows = BrowserWindow.getAllWindows();
  const existingWindow = loadExistingWindow(
    allWindows,
    APP_FEATURES_PAGE_TITLE
  );

  const bWindow = new BrowserWindow(config);

  remote.enable(bWindow.webContents);

  return {
    windowObj: existingWindow ?? bWindow,
    isExisting: !!existingWindow,
  };
};

export const appFeaturesWindow = (isRenderedPage = false, focus = true) => {
  try {
    if (_appFeaturesWindow) {
      if (focus) {
        _appFeaturesWindow.focus();
        _appFeaturesWindow.show();
      }

      return _appFeaturesWindow;
    }

    // show the existing _appFeaturesWindow
    const { windowObj, isExisting } = appFeaturesCreateWindow(isRenderedPage);

    // return the existing windowObj object
    if (isExisting) {
      return windowObj;
    }

    _appFeaturesWindow = windowObj;
    _appFeaturesWindow.loadURL(`${PATHS.loadUrlPath}#appFeaturesPage`);
    _appFeaturesWindow.webContents.on('did-finish-load', () => {
      if (focus) {
        _appFeaturesWindow.show();
        _appFeaturesWindow.focus();
      }
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
      contextIsolation: false,
      enableRemoteModule: true,
    },
    backgroundColor: getWindowBackgroundColor(),
  };

  // incoming call from a rendered page
  if (isRenderedPage) {
    const allWindows = remote.BrowserWindow.getAllWindows();
    const existingWindow = loadExistingWindow(
      allWindows,
      KEYBOARD_SHORTCUTS_PAGE_TITLE
    );

    return {
      windowObj: enableRemoteMainForRenderer({
        existingWindow,
        windowConfig: config,
      }),
      isExisting: !!existingWindow,
    };
  }

  // incoming call from the main process
  const allWindows = BrowserWindow.getAllWindows();
  const existingWindow = loadExistingWindow(
    allWindows,
    KEYBOARD_SHORTCUTS_PAGE_TITLE
  );

  const bWindow = new BrowserWindow(config);

  remote.enable(bWindow.webContents);

  return {
    windowObj: existingWindow ?? bWindow,
    isExisting: !!existingWindow,
  };
};

export const keyboardShortcutsWindow = (
  isRenderedPage = false,
  focus = true
) => {
  try {
    if (_keyboardShortcutsWindow) {
      if (focus) {
        _keyboardShortcutsWindow.focus();
        _keyboardShortcutsWindow.show();
      }

      return _keyboardShortcutsWindow;
    }

    // show the existing _keyboardShortcutsWindow
    const { windowObj, isExisting } =
      keyboardShortcutsCreateWindow(isRenderedPage);

    // return the existing windowObj object
    if (isExisting) {
      return windowObj;
    }

    _keyboardShortcutsWindow = windowObj;
    _keyboardShortcutsWindow.loadURL(
      `${PATHS.loadUrlPath}#keyboardShortcutsPage`
    );
    _keyboardShortcutsWindow.webContents.on('did-finish-load', () => {
      if (focus) {
        _keyboardShortcutsWindow.show();
        _keyboardShortcutsWindow.focus();
      }
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

/**
 * FAQs Window
 */

const helpFaqsCreateWindow = (isRenderedPage = false) => {
  const config = {
    width: 920,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    show: false,
    resizable: true,
    title: `${APP_TITLE}`,
    minimizable: true,
    fullscreenable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    backgroundColor: getWindowBackgroundColor(),
  };

  // incoming call from a rendered page
  if (isRenderedPage) {
    const allWindows = remote.BrowserWindow.getAllWindows();
    const existingWindow = loadExistingWindow(allWindows, FAQS_PAGE_TITLE);

    return {
      windowObj: enableRemoteMainForRenderer({
        existingWindow,
        windowConfig: config,
      }),
      isExisting: !!existingWindow,
    };
  }

  // incoming call from the main process
  const allWindows = BrowserWindow.getAllWindows();
  const existingWindow = loadExistingWindow(allWindows, FAQS_PAGE_TITLE);

  const bWindow = new BrowserWindow(config);

  remote.enable(bWindow.webContents);

  return {
    windowObj: existingWindow ?? bWindow,
    isExisting: !!existingWindow,
  };
};

export const faqsWindow = (isRenderedPage = false, focus = true) => {
  try {
    if (_faqsWindow) {
      if (focus) {
        _faqsWindow.focus();
        _faqsWindow.show();
      }

      return _faqsWindow;
    }

    // show the existing _faqsWindow
    const { windowObj, isExisting } = helpFaqsCreateWindow(isRenderedPage);

    // return the existing windowObj object
    if (isExisting) {
      return windowObj;
    }

    _faqsWindow = windowObj;
    _faqsWindow.loadURL(`${PATHS.loadUrlPath}#faqsPage`);
    _faqsWindow.webContents.on('did-finish-load', () => {
      if (focus) {
        _faqsWindow.show();
        _faqsWindow.focus();
      }
    });

    _faqsWindow.onerror = (error) => {
      log.error(error, `createWindows -> faqsWindow -> onerror`);
    };

    _faqsWindow.on('closed', () => {
      _faqsWindow = null;
    });

    return _faqsWindow;
  } catch (e) {
    log.error(e, `createWindows -> faqsWindow`);
  }
};

/**
 * Help - my Phone is not connecting windoe
 */

const helpPhoneNotConnectingCreateWindow = (isRenderedPage = false) => {
  const config = {
    width: 920,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    show: false,
    resizable: true,
    title: `${APP_TITLE}`,
    minimizable: true,
    fullscreenable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    backgroundColor: getWindowBackgroundColor(),
  };

  // incoming call from a rendered page
  if (isRenderedPage) {
    const allWindows = remote.BrowserWindow.getAllWindows();
    const existingWindow = loadExistingWindow(
      allWindows,
      HELP_PHONE_IS_NOT_CONNECTING
    );

    return {
      windowObj: enableRemoteMainForRenderer({
        existingWindow,
        windowConfig: config,
      }),
      isExisting: !!existingWindow,
    };
  }

  // incoming call from the main process
  const allWindows = BrowserWindow.getAllWindows();
  const existingWindow = loadExistingWindow(
    allWindows,
    HELP_PHONE_IS_NOT_CONNECTING
  );

  const bWindow = new BrowserWindow(config);

  remote.enable(bWindow.webContents);

  return {
    windowObj: existingWindow ?? bWindow,
    isExisting: !!existingWindow,
  };
};

export const helpPhoneNotConnectingWindow = (
  isRenderedPage = false,
  focus = true
) => {
  try {
    if (_helpPhoneIsNotConnectingWindow) {
      if (focus) {
        _helpPhoneIsNotConnectingWindow.focus();
        _helpPhoneIsNotConnectingWindow.show();
      }

      return _helpPhoneIsNotConnectingWindow;
    }

    // show the existing _helpPhoneIsNotConnectingWindow
    const { windowObj, isExisting } =
      helpPhoneNotConnectingCreateWindow(isRenderedPage);

    // return the existing windowObj object
    if (isExisting) {
      return windowObj;
    }

    _helpPhoneIsNotConnectingWindow = windowObj;
    _helpPhoneIsNotConnectingWindow.loadURL(
      `${PATHS.loadUrlPath}#helpPhoneNotConnectingPage`
    );
    _helpPhoneIsNotConnectingWindow.webContents.on('did-finish-load', () => {
      if (focus) {
        _helpPhoneIsNotConnectingWindow.show();
        _helpPhoneIsNotConnectingWindow.focus();
      }
    });

    _helpPhoneIsNotConnectingWindow.onerror = (error) => {
      log.error(
        error,
        `createWindows -> helpPhoneNotConnectingWindow -> onerror`
      );
    };

    _helpPhoneIsNotConnectingWindow.on('closed', () => {
      _helpPhoneIsNotConnectingWindow = null;
    });

    return _helpPhoneIsNotConnectingWindow;
  } catch (e) {
    log.error(e, `createWindows -> helpPhoneIsNotConnectingWindow`);
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
