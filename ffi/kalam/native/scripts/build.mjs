#!/usr/bin/env zx

/* eslint-disable */

import 'zx/globals';
import fs from 'fs-extra';
import { packageDirectory } from 'pkg-dir';
import replace from 'replace';
import chalk from 'chalk';
import macosVersion from 'macos-version';

await $`export LANG=en_US.UTF-8`;
await $`export LC_ALL=en_US.UTF-8`;

const DIR_MODE = 0o2775;
const PKG_ROOT_DIR = await packageDirectory();
const TEMP_ROOT_DIR = `${PKG_ROOT_DIR}/tmp`;
const LIBUSB_BOTTLE_TEMP_DIR = `${TEMP_ROOT_DIR}/libusb_cache`;
const KALAM_NATIVE_DIR = `${PKG_ROOT_DIR}/ffi/kalam/native`;
const BUILD_BASE_DIR = `${PKG_ROOT_DIR}/build`;

const orangeChalk = chalk.bold.hex('#FFA500');

// find the brew bottle hashes here: https://github.com/Homebrew/homebrew-core/blob/master/Formula/libusb.rb
const libusbBrewBottles = {
  d9121e56c7dbfad640c9f8e3c3cc621d88404dc1047a4a7b7c82fe06193bca1f: {
    sha256: `d9121e56c7dbfad640c9f8e3c3cc621d88404dc1047a4a7b7c82fe06193bca1f`,
    customFilePath: null, // null | {shouldProcessLibusbDylibConfig: boolean, shouldProcessPkgConfig: boolean, url: string }
    historicity: null,
    arch: `arm64`,
    os: `darwin`,
    osName: `mac`,
    osVersion: `big_sur`,
    libusbVersion: `1.0.26`,
  },
  '1318e1155192bdaf7d159562849ee8f73cb0f59b0cb77c142f8be99056ba9d9e': {
    sha256: `1318e1155192bdaf7d159562849ee8f73cb0f59b0cb77c142f8be99056ba9d9e`,
    customFilePath: null, // null | {shouldProcessLibusbDylibConfig: boolean, shouldProcessPkgConfig: boolean, url: string }
    historicity: null,
    arch: `amd64`,
    os: `darwin`,
    osName: `mac`,
    osVersion: `mojave`,
    libusbVersion: `1.0.24`,
  },
};

/**
 *  macOS version below Catalina (10.15) are classified as historical OSes
Support for these older version of the oses are now being deprecated because for OpenMTP to keep supporting these OSes, kernel dylibs needs to compiled on such older versions of macOS which is practically very difficult thing to do.
Usually the compilation of the kernel dylibs on these older OSes happen very rarely and only when there is a security issue or something.
The dylib files compiled against these older versions (historical versions) of macos are built into the directories: `build/mac/bin/medieval`
Compiling dylibs on the historical macos versions doesn't overwrite builds in the `build/mac/bin/arm64/` or `build/mac/bin/amd64/` which contains the dylibs for the latest and supported versions of macos
 */

// To support macOS version below Big Sur the Kalam kernel needs to be compiled on an older macOS machine everytime there is an update, which is practically very difficult.
// So any version included in the [KALAM_HISTORIC_VERSION_TYPE] will not receive the latest Kalam Kernel updates
export const KALAM_HISTORIC_VERSION_TYPE = {
  medieval: 'medieval', // macOS 10.14 (Mojave) and 10.15 (Catalina). libusb support is still available but since it requires Mojave or lower to compile the kernel, it is being deprecated.
};

// if the user's os version is higher than the ones listed here then latest kalam kernel binaies will be used
// reference: https://github.com/npm/node-semver#ranges
export const KALAM_HISTORIC_MACOS_VERSION_RANGE = {
  [KALAM_HISTORIC_VERSION_TYPE.medieval]: `>=10.14 <=10.15.999`,
};

let isBuildingOnAHistoricMacOs = false;

const historicalLibusbBrewBottles = {
  '1318e1155192bdaf7d159562849ee8f73cb0f59b0cb77c142f8be99056ba9d9e': {
    sha256: `1318e1155192bdaf7d159562849ee8f73cb0f59b0cb77c142f8be99056ba9d9e`,
    customFilePath: null, // null | {shouldProcessLibusbDylibConfig: boolean, shouldProcessPkgConfig: boolean, url: string }
    isForHistoricMacos: true,
    historicity: {
      buildDir: KALAM_HISTORIC_VERSION_TYPE.medieval,
    },
    arch: `amd64`,
    os: `darwin`,
    osName: `mac`,
    osVersion: `mojave`,
    libusbVersion: `1.0.24`,
  },
};

function buildCompatibilityChecks() {
  if (macosVersion.is('<10.14')) {
    throw new Error(
      'To build the Kalam dylib files at least macOS >=10.14 is required'
    );
  }

  for (const [, value] of Object.entries(KALAM_HISTORIC_MACOS_VERSION_RANGE)) {
    if (macosVersion.is(value)) {
      isBuildingOnAHistoricMacOs = true;

      console.info(
        orangeChalk(`This is a historical version of macOS.
macOS version below Catalina (10.15) are classified as historical OSes
Support for these older version of the oses are now being deprecated because for OpenMTP to keep supporting these OSes, kernel dylibs needs to compiled on such older versions of macOS which is practically very difficult thing to do.
Usually the compilation of the kernel dylibs on these older OSes happen very rarely and only when there is a security issue or something.
The dylib files compiled against these older versions (historical versions) of macos are built into the directories: 'build/mac/bin/medieval'
Compiling dylibs on the historical macos versions doesn't overwrite builds in the 'build/mac/bin/arm64/' or 'build/mac/bin/amd64/' which contains the dylibs for the latest and supported versions of macos
      `)
      );

      break;
    }
  }
}

buildCompatibilityChecks();

async function getCmd(cmd) {
  const op = await $`${cmd}`;

  return op.stdout.trimEnd();
}

function getBottlePath({ prefix, bottle }) {
  return `${prefix}_${bottle.libusbVersion}_${bottle.osVersion}_${bottle.os}_${bottle.arch}`;
}

function getLibusbBottleCachePath({ bottle }) {
  const libusbFullFileName = `libusb-1.0.0.dylib`;
  const libusbCleanedFileName = `libusb.dylib`;
  const kalamFileName = `kalam.dylib`;
  const kalamDebugReportFileName = `kalam_debug_report`;

  const identifier = getBottlePath({ prefix: 'libusb', bottle });
  const tarball = `${LIBUSB_BOTTLE_TEMP_DIR}/${identifier}.tar.gz`;
  const extracted = `${LIBUSB_BOTTLE_TEMP_DIR}/${identifier}`;
  const pkgconfigBaseDir = `${extracted}/libusb/${bottle.libusbVersion}/lib/pkgconfig`;
  const pkgconfig = `${pkgconfigBaseDir}/libusb-1.0.pc`;
  const pkgConfigPrefix = `${extracted}`;
  const libusbDylib = `${extracted}/libusb/${bottle.libusbVersion}/lib/${libusbFullFileName}`;

  let buildDir;
  if (bottle.historicity) {
    buildDir = `${BUILD_BASE_DIR}/${bottle.osName}/bin/${bottle.historicity.buildDir}/${bottle.arch}`;
  } else {
    buildDir = `${BUILD_BASE_DIR}/${bottle.osName}/bin/${bottle.arch}`;
  }

  const libusbDylibInBuildDir = `${buildDir}/${libusbCleanedFileName}`;
  const kalamDylibInBuildDir = `${buildDir}/${kalamFileName}`;
  const kalamDebugReportInBuildDir = `${buildDir}/${kalamDebugReportFileName}`;
  const rpath = `@loader_path/${libusbCleanedFileName}`;

  return {
    bottle,
    identifier,
    tarball,
    extracted,
    pkgconfig,
    pkgconfigBaseDir,
    pkgConfigPrefix,
    buildDir,
    libusbDylib,
    libusbDylibInBuildDir,
    kalamDylibInBuildDir,
    kalamDebugReportInBuildDir,
    rpath,
  };
}

await cd(PKG_ROOT_DIR);
const currentDir = await getCmd(`pwd`);

if (currentDir !== PKG_ROOT_DIR) {
  throw `The current working directory should be ${PKG_ROOT_DIR}`;
}

console.info(`creating the temp directory in ${TEMP_ROOT_DIR}...\n`);
await fs.ensureDirSync(TEMP_ROOT_DIR, DIR_MODE);

console.info(
  `creating the libusb temp directory in ${LIBUSB_BOTTLE_TEMP_DIR}...\n`
);
await fs.ensureDirSync(LIBUSB_BOTTLE_TEMP_DIR, DIR_MODE);
$`chmod -R +w ${LIBUSB_BOTTLE_TEMP_DIR}`;

// downloading the 'libusb' Brew bottles
console.info(`downloading the 'libusb' Brew bottles...\n`);

async function runPrerequisites({ bottles }) {
  console.info(`running prerequisites on the brew bottles...`);

  for await (const [, bottle] of Object.entries(bottles)) {
    console.info(
      `attempting to download the libusb tar file for: ${bottle.os}-${bottle.osName}-${bottle.osVersion}-${bottle.arch}-${bottle.libusbVersion}`
    );

    const bottlePath = getLibusbBottleCachePath({ bottle });
    if (bottle.customFilePath) {
      console.info(`downloading the libusb tar file from custom url`);

      await $`curl -L -o ${bottlePath.tarball} ${bottle.customFilePath.url}`;
    } else {
      await $`curl -L -H "Authorization: Bearer QQ==" -o ${bottlePath.tarball} https://ghcr.io/v2/homebrew/core/libusb/blobs/sha256:${bottle.sha256}`;
    }
  }

  // unarchiving the 'libusb' Brew bottles
  console.info(`unarchiving the 'libusb' Brew bottles...\n`);

  for await (const [, bottle] of Object.entries(bottles)) {
    console.info(
      `attempting to unarchive the libusb tar file for: ${bottle.os}-${bottle.osName}-${bottle.osVersion}-${bottle.arch}-${bottle.libusbVersion}`
    );

    const bottlePath = getLibusbBottleCachePath({ bottle });
    console.info(
      `[${bottlePath.identifier}] creating the libusb temp directory in ${bottlePath.extracted}...\n`
    );
    await fs.ensureDirSync(bottlePath.extracted, DIR_MODE);
    await $`LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 tar -xvf ${bottlePath.tarball} -C ${bottlePath.extracted} --no-same-permissions`;
    await $`chmod -R +w ${bottlePath.extracted}`;
  }

  await $`sleep 1`;

  // processing the 'libusb' Brew bottles
  console.info(`processing the 'libusb' Brew bottles...\n`);

  for await (const [, bottle] of Object.entries(bottles)) {
    console.info(
      `attempting to process the libusb tar file for: ${bottle.os}-${bottle.osName}-${bottle.osVersion}-${bottle.arch}-${bottle.libusbVersion}`
    );

    const bottlePath = getLibusbBottleCachePath({ bottle });

    if (bottle.customFilePath?.shouldProcessPkgConfig !== false) {
      // replacing the string `@@HOMEBREW_CELLAR@@` in the pkg-config file
      console.info(
        `[${bottlePath.identifier}] replacing the string '@@HOMEBREW_CELLAR@@' in the pkg-config file...\n`
      );
      await replace({
        regex: '@@HOMEBREW_CELLAR@@',
        replacement: bottlePath.pkgConfigPrefix,
        paths: [bottlePath.pkgconfig],
        recursive: false,
        silent: false,
      });
    } else {
      console.info(
        `skipping the processing of the pkg config which was downloaded from the custom file path`
      );
    }

    if (bottle.customFilePath?.shouldProcessLibusbDylibConfig !== false) {
      // copying the libusb-1.0.0.dylib to the build directory
      console.info(
        `[${bottlePath.identifier}] attempting to copy the libusb-1.0.0.dylib to the build directory...\n`
      );

      await fs.ensureDirSync(bottlePath.buildDir, DIR_MODE);
      await fs.copyFileSync(
        bottlePath.libusbDylib,
        bottlePath.libusbDylibInBuildDir
      );

      // fixing the rpath in the libusb-1.0.0.dylib
      console.info(
        `[${bottlePath.identifier}] fixing the rpath in the libusb-1.0.0.dylib...\n`
      );

      // todo: FIXME
      //  strangely the `install_name_tool` command doesnt work on a macos monterey dylib file
      await $`install_name_tool -id ${bottlePath.rpath} ${bottlePath.libusbDylib}`;
    } else {
      console.info(
        `skipping the processing of the libusb dylib which was downloaded from the custom file path`
      );
    }
  }

  await $`sleep 1`;
}

let chosenBottlesForBuilding;
// building binaries on and for the latest and supported macos versions
if (!isBuildingOnAHistoricMacOs) {
  chosenBottlesForBuilding = libusbBrewBottles;

  await runPrerequisites({ bottles: chosenBottlesForBuilding });
}
// building binaries on and for the historical and deprecated macos versions
else {
  chosenBottlesForBuilding = historicalLibusbBrewBottles;

  await runPrerequisites({ bottles: chosenBottlesForBuilding });
}

for await (const [, bottle] of Object.entries(chosenBottlesForBuilding)) {
  const bottlePath = getLibusbBottleCachePath({ bottle });

  // building kalam
  console.info(`building kalam...\n`);
  await $`(
  cd ${KALAM_NATIVE_DIR} && CGO_ENABLED=1 \
        PKG_CONFIG_PATH=${bottlePath.pkgconfigBaseDir} \
        CGO_CFLAGS='-Wno-deprecated-declarations' \
        GOARCH=${bottle.arch} GOOS=${bottle.os} \
        go build \
        -v -a -trimpath \
        -o ${bottlePath.kalamDylibInBuildDir} -buildmode=c-shared ./*.go
        )`;

  // building kalam_debug_report
  console.info(`building kalam_debug_report...\n`);
  await $`(
  cd ${KALAM_NATIVE_DIR} && CGO_ENABLED=1 \
        PKG_CONFIG_PATH=${bottlePath.pkgconfigBaseDir} \
        CGO_CFLAGS='-Wno-deprecated-declarations' \
        GOARCH=${bottle.arch} GOOS=${bottle.os} \
        go build \
        -v -a -trimpath \
        -o ${bottlePath.kalamDebugReportInBuildDir} kalam_debug_report/*.go
        )`;
}
