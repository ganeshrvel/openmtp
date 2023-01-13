const OS_ARCH_TYPE = {
  amd64: 'amd64',
  arm64: 'arm64',
};

const getBinariesSupportedSystemArchitecture = () => {
  if (process.arch === 'arm64') {
    return OS_ARCH_TYPE.arm64;
  }

  return OS_ARCH_TYPE.amd64;
};

module.exports = () => {
  const getExtraFiles = () => {
    const currentSystemArch = getBinariesSupportedSystemArchitecture();

    let macResourceBinFilter;

    switch (currentSystemArch) {
      case OS_ARCH_TYPE.arm64:
        macResourceBinFilter = [`${OS_ARCH_TYPE.arm64}/**/*`, `mtp-cli`];
        break;

      case OS_ARCH_TYPE.amd64:
      default:
        macResourceBinFilter = [
          `${OS_ARCH_TYPE.amd64}/**/*`,
          `medieval/${OS_ARCH_TYPE.amd64}/**/*`,
          `mtp-cli`,
        ];

        break;
    }

    return [
      {
        from: 'build/mac/bin',
        to: 'Resources/bin',
        filter: macResourceBinFilter,
      },
    ];
  };

  return {
    productName: 'OpenMTP',
    appId: 'io.ganeshrvel.openmtp',
    forceCodeSigning: true,
    // eslint-disable-next-line no-template-curly-in-string
    artifactName: '${name}-${version}-${os}-${arch}.${ext}',
    copyright: '© Ganesh Rathinavel',
    afterPack: './internals/scripts/AfterPack.js',
    afterSign: './internals/scripts/Notarize.js',
    npmRebuild: false,
    publish: [
      {
        provider: 'github',
        owner: 'ganeshrvel',
        repo: 'openmtp',
        private: false,
      },
    ],
    files: [
      'app/dist/',
      'app/app.html',
      'app/main.prod.js',
      'app/main.prod.js.map',
      'package.json',
    ],
    extraFiles: getExtraFiles(),
    mac: {
      type: 'distribution',
      icon: 'build/icon.icns',
      category: 'public.app-category.productivity',
      hardenedRuntime: true,
      gatekeeperAssess: false,
      entitlements: './build/entitlements.mac.plist',
      entitlementsInherit: './build/entitlements.mac.plist',
      extendInfo: {
        LSMinimumSystemVersion: '10.11.0',
        NSDesktopFolderUsageDescription: 'Desktop folder access',
        NSDocumentsFolderUsageDescription: 'Documents folder access',
        NSDownloadsFolderUsageDescription: 'Downloads folder access',
        NSRemovableVolumesUsageDescription: 'Removable Disk access',
        NSPhotoLibraryUsageDescription: 'Photo library access',
      },
      target: {
        target: 'default',
      },
    },
    mas: {
      type: 'distribution',
      category: 'public.app-category.productivity',
      entitlements: 'build/entitlements.mas.plist',
      icon: 'build/icon.icns',
      binaries: ['dist/mas/OpenMTP.app/Contents/Resources/bin/mtp-cli'],
    },
    dmg: {
      contents: [
        {
          x: 130,
          y: 220,
        },
        {
          x: 410,
          y: 220,
          type: 'link',
          path: '/Applications',
        },
      ],
    },
    win: {
      target: ['nsis'],
    },
    linux: {
      target: ['deb', 'AppImage'],
      category: 'public.app-category.productivity',
    },
  };
};
