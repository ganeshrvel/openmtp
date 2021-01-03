import { join, parse } from 'path';
import { homedir as homedirOs } from 'os';
import { APP_BUNDLE_ID } from '../constants/meta';

const homeDir = homedirOs();

export const getAppDataPath = () => {
  switch (process.platform) {
    case 'darwin':
      return join(homeDir, 'Library', 'Application Support', APP_BUNDLE_ID);

    case 'win32':
      return join(process.env.APPDATA, APP_BUNDLE_ID);

    case 'linux':
      return join(homeDir, APP_BUNDLE_ID);

    default: {
      process.exit(1);
    }
  }
};

export const pathUp = (filePath) => {
  return filePath.replace(/\/$/, '').replace(/\/[^/]+$/, '') || '/';
};

export const sanitizePath = (filePath) => {
  return filePath.replace(/\/\/+/g, '/');
};

export const baseName = (filePath) => {
  if (typeof filePath === 'undefined' || filePath === null) {
    return null;
  }

  const parsedPath = pathInfo(filePath);

  return parsedPath !== null ? parsedPath.base : null;
};

export const getExtension = (fileName, isFolder) => {
  if (isFolder) {
    return null;
  }

  const parsedPath = pathInfo(fileName);

  return parsedPath !== null ? parsedPath.ext : null;
};

export const pathInfo = (filePath) => {
  return parse(filePath);
};
