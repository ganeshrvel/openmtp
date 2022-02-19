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

const binariesPath = () => {
  if (IS_PROD && isPackaged) {
    return path.join(root, './Contents', './Resources', './bin');
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

  return path.join(root, './build', getPlatform(), './bin', binariesDir);
};

// todo fix
console.log('fix this');
export const mtpCliPath = path.resolve(path.join(binariesPath(), './mtp-cli'));

export const kalamDebugReportCli = path.resolve(
  path.join(binariesPath(), './kalam-debug-report')
);

console.log(binariesPath());
export const kalamLibPath = path.resolve(
  path.join(binariesPath(), './kalam.dylib')
);
