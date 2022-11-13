import { ipcMain } from 'electron';
import { IpcEvents } from './IpcEventType';
import {
  faqsWindow,
  helpPhoneNotConnectingWindow,
  privacyPolicyWindow,
  reportBugsWindow,
} from '../../helpers/createWindows';

export default class IpcEventService {
  static shared = new IpcEventService();

  start() {
    this.#init();
  }

  #init = () => {
    // todo move all create window methods to IpcEventService and all window create methods from renderer should be event-driven (aka via IpcEventService). The main process windows could be directly invoked.
    //  This is done to avoid issues with 'electron/remote' (in the packaged builds the electron/remote enable doesn't work)

    ipcMain.on(IpcEvents.OPEN_FAQS_WINDOW, (_, __) => {
      faqsWindow(false);
    });
    ipcMain.on(IpcEvents.OPEN_HELP_PHONE_NOT_CONNECTING_WINDOW, (_, __) => {
      helpPhoneNotConnectingWindow(false);
    });
    ipcMain.on(IpcEvents.OPEN_HELP_PRIVACY_POLICY_WINDOW, (_, __) => {
      privacyPolicyWindow(false);
    });

    ipcMain.on(IpcEvents.REPORT_BUGS_DISPOSE_MTP_REPLY, (_, args) => {
      reportBugsWindow(false, false)?.send(
        IpcEvents.REPORT_BUGS_DISPOSE_MTP_REPLY_FROM_MAIN,
        args
      );
    });
  };
}
