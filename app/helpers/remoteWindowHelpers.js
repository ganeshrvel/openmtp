import { IS_RENDERER } from '../constants/env';

export const getRemoteWindow = () => {
  let remote;

  if (IS_RENDERER) {
    remote = window.require('@electron/remote');
  } else {
    // eslint-disable-next-line global-require
    remote = require('@electron/remote/main');
  }

  return remote;
};
