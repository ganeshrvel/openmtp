'use strict';

import { remote } from 'electron';

export const toggleWindowSizeOnDoubleClick = () => {
  const window = remote.getCurrentWindow();
  if (!window.isMaximized()) {
    window.maximize();
    return null;
  }
  window.unmaximize();
};
