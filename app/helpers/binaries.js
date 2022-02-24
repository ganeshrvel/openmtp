import path from 'path';
import macosVersion from 'macos-version';
import {
  getPlatform,
  getBinariesSupportedSystemArchitecture,
} from '../utils/getPlatform';
import { IS_PROD } from '../constants/env';
import { PATHS } from '../constants/paths';
import { isPackaged } from '../utils/isPackaged';
import { KALAM_MINIMUM_SUPPORTED_MACOS_VERSION } from '../constants';

const { root } = PATHS;

const binariesPath = ({ includeArchDirectory = true }) => {
  const isPackagedBuild = IS_PROD && isPackaged;
  const debugBinDir = path.join(root, './build', getPlatform(), './bin');

  const supportedSystemArchitecture = getBinariesSupportedSystemArchitecture();
  const doesCurrentOsSupportLatestBinaries =
    macosVersion.isGreaterThanOrEqualTo(
      KALAM_MINIMUM_SUPPORTED_MACOS_VERSION[supportedSystemArchitecture]
    );

  let binariesArchDir;

  if (doesCurrentOsSupportLatestBinaries) {
    binariesArchDir = getBinariesSupportedSystemArchitecture();
  } else {
    binariesArchDir = path.join(
      'historic',
      getBinariesSupportedSystemArchitecture()
    );
  }

  /// release build binaries path
  if (isPackagedBuild) {
    const packagedBinDir = path.join(
      root,
      './Contents',
      './Resources',
      './bin'
    );

    /// if [includeArchDirectory] is true then dont include the architecture directories
    if (!includeArchDirectory) {
      return packagedBinDir;
    }

    return path.join(packagedBinDir, binariesArchDir);
  }

  /// debug build binaries path

  /// if [includeArchDirectory] is true then dont include the architecture directories
  if (!includeArchDirectory) {
    return debugBinDir;
  }

  return path.join(debugBinDir, binariesArchDir);
};

export const mtpCliPath = path.resolve(
  path.join(binariesPath({ includeArchDirectory: false }), './mtp-cli')
);

export const kalamDebugReportCli = path.resolve(
  path.join(
    binariesPath({ includeArchDirectory: true }),
    './kalam-debug-report'
  )
);

export const kalamLibPath = path.resolve(
  path.join(binariesPath({ includeArchDirectory: true }), './kalam.dylib')
);
