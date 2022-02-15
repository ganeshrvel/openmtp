import { getRemoteWindow } from './remoteWindowHelpers';

const remote = getRemoteWindow();

export const toggleWindowSizeOnDoubleClick = () => {
  const window = remote.getCurrentWindow();

  if (!window.isMaximized()) {
    window.maximize();

    return null;
  }

  window.unmaximize();
};
