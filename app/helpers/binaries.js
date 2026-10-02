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
  KALAM_SEG5_MACOS_VERSION_RANGE,
  OS_ARCH_TYPE,
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

const shouldUseKalamSeg5Binaries = () =>
  getPlatform() === 'mac' &&
  getBinariesSupportedSystemArchitecture() === OS_ARCH_TYPE.arm64 &&
  macosVersion.is(KALAM_SEG5_MACOS_VERSION_RANGE);

export const mtpCliPath = path.resolve(
  path.join(binariesPath({ includeArchDirectory: false }), './mtp-cli')
);

// OPENMTP_ADB_PATH is intentionally an explicit development override. Release
// builds use the platform-tools binary shipped in Resources/bin, never PATH.
export const adbPath = process.env.OPENMTP_ADB_PATH
  ? path.resolve(process.env.OPENMTP_ADB_PATH)
  : path.resolve(
      path.join(binariesPath({ includeArchDirectory: false }), './adb')
    );

export const kalamDebugReportCli = path.resolve(
  path.join(
    binariesPath({ includeArchDirectory: true }),
    shouldUseKalamSeg5Binaries()
      ? './kalam_debug_report-seg5'
      : './kalam_debug_report'
  )
);

export const kalamLibPath = path.resolve(
  path.join(
    binariesPath({ includeArchDirectory: true }),
    shouldUseKalamSeg5Binaries() ? './kalam-seg5.dylib' : './kalam.dylib'
  )
);

// We have now officially retired the support for `Kalam` Kernel on macOS 10.13 (OS X El High Sierra) and lower. Only the "Legacy" MTP mode will continue working on these outdated machines.
export function isKalamModeSupported() {
  return macosVersion.is(KALAM_MODE_MIN_MACOS_VERSION);
}
