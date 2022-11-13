import { platform, release } from 'os';
import macosVersion from 'macos-version';
import { OS_ARCH_TYPE } from '../constants';

export const getPlatform = () => {
  switch (platform()) {
    case 'aix':
    case 'freebsd':
    case 'linux':
    case 'openbsd':
    case 'android':
      return 'linux';
    case 'darwin':
    case 'sunos':
      return 'mac';
    case 'win32':
      return 'win';
    default:
      return null;
  }
};

// these are currently supported system architectures for binaries
export const getBinariesSupportedSystemArchitecture = () => {
  if (process.arch === 'arm64') {
    return OS_ARCH_TYPE.arm64;
  }

  return OS_ARCH_TYPE.amd64;
};

export const getOsVersion = () => {
  if (macosVersion.isMacOS) {
    return macosVersion();
  }

  return release();
};
