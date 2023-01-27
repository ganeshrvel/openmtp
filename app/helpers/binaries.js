import path from 'path';
import macosVersion from 'macos-version';
import {
  getPlatform,
  getBinariesSupportedSystemArchitecture,
} from '../utils/getPlatform';
import { IS_PROD } from '../constants/env';
import { PATHS } from '../constants/paths';
import { isPackaged } from '../utils/isPackaged';
import {
  KALAM_HISTORIC_MACOS_VERSION_RANGE,
  KALAM_MODE_MIN_MACOS_VERSION,
} from '../constants';
import { undefinedOrNull } from '../utils/funcs';

const { root } = PATHS;

const binariesPath = ({ includeArchDirectory = true }) => {
  const isPackagedBuild = IS_PROD && isPackaged;
  const debugBinDir = path.join(root, './build', getPlatform(), './bin');

  let historicBinaryVersionName;

  for (const [key, value] of Object.entries(
    KALAM_HISTORIC_MACOS_VERSION_RANGE
  )) {
    if (macosVersion.is(value)) {
      historicBinaryVersionName = key;
      break;
    }
  }

  const doesCurrentOsSupportLatestBinaries = undefinedOrNull(
    historicBinaryVersionName
  );

  let binariesArchDir;

  if (doesCurrentOsSupportLatestBinaries) {
    binariesArchDir = getBinariesSupportedSystemArchitecture();
  } else {
    binariesArchDir = path.join(
      historicBinaryVersionName,
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
    './kalam_debug_report'
  )
);

export const kalamLibPath = path.resolve(
  path.join(binariesPath({ includeArchDirectory: true }), './kalam.dylib')
);

// We have now officially retired the support for `Kalam` Kernel on macOS 10.13 (OS X El High Sierra) and lower. Only the "Legacy" MTP mode will continue working on these outdated machines.
export function isKalamModeSupported() {
  return macosVersion.is(KALAM_MODE_MIN_MACOS_VERSION);
}
