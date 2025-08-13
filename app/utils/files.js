import { join, parse } from 'path';
import { homedir as homedirOs } from 'os';
import { APP_BUNDLE_ID } from '../constants/meta';
import fs from 'fs';

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

export const calculateFolderSize = (folderPath) => {
  return new Promise((resolve, reject) => {
    let totalSize = 0;

    fs.readdir(folderPath, (err, files) => {
      if (err) {
        return reject(err);
      }

      let pending = files.length;
      if (!pending) {
        return resolve(totalSize);
      }

      files.forEach((file) => {
        const filePath = join(folderPath, file);

        fs.stat(filePath, (err, stats) => {
          if (err) {
            return reject(err);
          }

          if (stats.isDirectory()) {
            calculateFolderSize(filePath).then((size) => {
              totalSize += size;
              if (!--pending) {
                resolve(totalSize);
              }
            }).catch(reject);
          } else {
            totalSize += stats.size;
            if (!--pending) {
              resolve(totalSize);
            }
          }
        });
      });
    });
  });
};
