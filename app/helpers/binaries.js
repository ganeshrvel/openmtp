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
  const binDir = path.join(root, './build', getPlatform(), './bin');

  // todo fix
  console.log('fix this');
  /// release build binaries path
  if (IS_PROD && isPackaged) {
    return path.join(root, './Contents', './Resources', './bin');
  }

  /// debug build binaries path

  /// if [includeArchDirectory] is true then dont include the architecture directories
  if (!includeArchDirectory) {
    return binDir;
  }

  const supportedSystemArchitecture = getBinariesSupportedSystemArchitecture();
  const doesCurrentOsSupportLatestBinaries =
    macosVersion.isGreaterThanOrEqualTo(
      KALAM_MINIMUM_SUPPORTED_MACOS_VERSION[supportedSystemArchitecture]
    );

  let binariesDir;

  if (doesCurrentOsSupportLatestBinaries) {
    binariesDir = getBinariesSupportedSystemArchitecture();
  } else {
    binariesDir = path.join(
      'historic',
      getBinariesSupportedSystemArchitecture()
    );
  }

  return path.join(binDir, binariesDir);
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
