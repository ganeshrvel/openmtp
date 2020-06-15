'use strict';

import { app, Menu } from 'electron';
import {
  appFeaturesWindow,
  keyboardShortcutsWindow,
  privacyPolicyWindow,
  reportBugsWindow
} from './utils/createWindows';
import { DEBUG_PROD, IS_DEV } from './constants/env';
import { APP_NAME, APP_GITHUB_URL } from './constants/meta';
import { openExternalUrl } from './utils/url';
import { DONATE_PAYPAL_URL } from './constants';
import { inviteViaEmail } from './templates/menu';

export default class MenuBuilder {
  constructor({ mainWindow, autoAppUpdate, appUpdaterEnable }) {
    this.mainWindow = mainWindow;
    this.autoAppUpdate = autoAppUpdate;
    this.appUpdaterEnable = appUpdaterEnable;
  }

  buildMenu() {
    if (IS_DEV || DEBUG_PROD) {
      this.setupDevelopmentEnvironment();
    }

    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment() {
    this.mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.inspectElement(x, y);
          }
        }
      ]).popup(this.mainWindow);
    });

    this.mainWindow.openDevTools();
  }

  buildDarwinTemplate() {
    const subMenuAbout = {
      label: `${APP_NAME}`,
      submenu: [
        {
          label: `About ${APP_NAME}`,
          selector: 'orderFrontStandardAboutPanel:'
        },
        { type: 'separator' },
        {
          visible: this.appUpdaterEnable,
          label: 'Check For Updates',
          click: () => {
            this.autoAppUpdate.forceCheck();
          }
        },
        { type: 'separator' },
        {
          label: `Hide ${APP_NAME}`,
          accelerator: 'Command+H',
          selector: 'hide:'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:'
        },
        { label: 'Show All', selector: 'unhideAllApplications:' },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    };
    const subMenuEdit = {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'Command+Z',
          selector: 'undo:',
          role: 'undo'
        },
        {
          label: 'Redo',
          accelerator: 'Command+Y',
          selector: 'redo:',
          role: 'redo'
        },
        { type: 'separator' },
        {
          label: 'Cut',
          accelerator: 'Command+X',
          selector: 'cut:',
          role: 'cut'
        },
        {
          label: 'Copy',
          accelerator: 'Command+C',
          selector: 'copy:',
          role: 'copy'
        },
        {
          label: 'Paste',
          accelerator: 'Command+V',
          selector: 'paste:',
          role: 'paste'
        },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          selector: 'selectAll:',
          role: 'selectAll'
        }
      ]
    };
    const subMenuViewDev = {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: () => {
            this.mainWindow.webContents.reload();
          }
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.toggleDevTools();
          }
        }
      ]
    };
    const subMenuViewProd = {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          }
        }
      ]
    };
    const subMenuWindow = {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:'
        },
        { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
        { type: 'separator' },
        { label: 'Bring All To Front', selector: 'arrangeInFront:' }
      ]
    };
    const subMenuHelp = {
      label: 'Help',
      submenu: [
        {
          label: 'Report Bugs',
          click: () => {
            reportBugsWindow();
          }
        },
        {
          label: 'Keyboard Shortcuts',
          click: () => {
            keyboardShortcutsWindow();
          }
        },
        {
          label: 'New Features And Updates',
          click: () => {
            appFeaturesWindow();
          }
        },
        {
          label: 'Privacy Policy',
          click: () => {
            privacyPolicyWindow();
          }
        },
        {
          label: 'Buy Me A Coffee!',
          click: () => {
            openExternalUrl(DONATE_PAYPAL_URL);
          }
        },
        {
          label: `Invite A Friend`,
          click: () => {
            openExternalUrl(`${inviteViaEmail}`);
          }
        },
        {
          label: 'Find Us On GitHub',
          click: () => {
            openExternalUrl(APP_GITHUB_URL);
          }
        }
      ]
    };

    const subMenuView =
      process.env.NODE_ENV === 'development' ? subMenuViewDev : subMenuViewProd;

    return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp];
  }

  buildDefaultTemplate() {
    return [
      {
        label: '&File',
        submenu: [
          {
            label: '&Open',
            accelerator: 'Ctrl+O'
          },
          {
            label: '&Close',
            accelerator: 'Ctrl+W',
            click: () => {
              this.mainWindow.close();
            }
          }
        ]
      },
      {
        label: '&View',
        submenu:
          process.env.NODE_ENV === 'development'
            ? [
                {
                  label: '&Reload',
                  accelerator: 'Ctrl+R',
                  click: () => {
                    this.mainWindow.webContents.reload();
                  }
                },
                {
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen()
                    );
                  }
                },
                {
                  label: 'Toggle &Developer Tools',
                  accelerator: 'Alt+Ctrl+I',
                  click: () => {
                    this.mainWindow.toggleDevTools();
                  }
                }
              ]
            : [
                {
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen()
                    );
                  }
                }
              ]
      },
      {
        label: 'Help',
        submenu: [
          {
            visible: this.appUpdaterEnable,
            label: 'Check For Updates',
            click: () => {
              this.autoAppUpdate.forceCheck();
            }
          },
          {
            label: 'Report Bugs',
            click: () => {
              reportBugsWindow();
            }
          },
          {
            label: 'Keyboard Shortcuts',
            click: () => {
              keyboardShortcutsWindow();
            }
          },
          {
            label: 'New Features And Updates',
            click: () => {
              appFeaturesWindow();
            }
          },
          {
            label: 'Privacy Policy',
            click: () => {
              privacyPolicyWindow();
            }
          },
          {
            label: 'Buy Me A Coffee!',
            click: () => {
              openExternalUrl(DONATE_PAYPAL_URL);
            }
          },
          {
            label: `Invite A Friend`,
            click: () => {
              openExternalUrl(`${inviteViaEmail}`);
            }
          },
          {
            label: 'Find Us On GitHub',
            click: () => {
              openExternalUrl(APP_GITHUB_URL);
            }
          }
        ]
      }
    ];
  }
}
