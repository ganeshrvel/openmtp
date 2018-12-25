'use strict';

import { shell } from 'electron';

export const openExternalUrl = (url, events = null) => {
  if (events) {
    events.preventDefault();
  }
  shell.openExternal(url);
};
