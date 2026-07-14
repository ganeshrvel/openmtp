import path from 'path';
import {
  getPlatform,
  getBinariesSupportedSystemArchitecture,
} from '../utils/getPlatform';
import { IS_PROD } from '../constants/env';
import { PATHS } from '../constants/paths';
import { isPackaged } from '../utils/isPackaged';

const { root } = PATHS;

const binariesPath = ({ includeArchDirectory = true }) => {
  const isPackagedBuild = IS_PROD && isPackaged;
  const debugBinDir = path.join(root, './build', getPlatform(), './bin');

  const binariesArchDir = getBinariesSupportedSystemArchitecture();

  if (isPackagedBuild) {
    const packagedBinDir = path.join(
      root,
      './Contents',
      './Resources',
      './bin',
    );

    if (!includeArchDirectory) {
      return packagedBinDir;
    }

    return path.join(packagedBinDir, binariesArchDir);
  }

  if (!includeArchDirectory) {
    return debugBinDir;
  }

  return path.join(debugBinDir, binariesArchDir);
};

export const kalamDebugReportCli = path.resolve(
  path.join(
    binariesPath({ includeArchDirectory: true }),
    './kalam_debug_report',
  ),
);

export const kalamLibPath = path.resolve(
  path.join(binariesPath({ includeArchDirectory: true }), './kalam.dylib'),
);
