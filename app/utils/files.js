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

/**
 * Check if a filename should be considered hidden on macOS
 * @param {string} fileName - The file name (not full path)
 * @returns {boolean} - True if the file should be hidden
 */
export const isMacOSHiddenFile = (fileName) => {
  if (!fileName) {
    return false;
  }

  // Unix-style hidden files (start with .)
  if (fileName.startsWith('.')) {
    return true;
  }

  // macOS-specific hidden files
  const macOSHiddenFiles = [
    'Icon\r', // Custom folder icon file (Icon followed by carriage return)
    'Icon?', // Alternative representation
    '.DS_Store', // Already caught by dot check, but explicit
    '.localized', // Localized folder names
    '.VolumeIcon.icns', // Volume icons
    'Desktop DB',
    'Desktop DF',
    '.Spotlight-V100',
    '.Trashes',
    '.fseventsd',
    '.TemporaryItems',
    '.DocumentRevisions-V100',
    '.PKInstallSandboxManager',
  ];

  return macOSHiddenFiles.includes(fileName);
};
