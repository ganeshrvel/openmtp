#!/usr/bin/env zx

import 'zx/globals';
import { packageDirectory } from 'pkg-dir';
import replace from 'replace';

await $`export LANG=en_US.UTF-8`;
await $`export LC_ALL=en_US.UTF-8`;

const DIR_MODE = 0o2775;
const PKG_ROOT_DIR = await packageDirectory();
const TEMP_ROOT_DIR = `${PKG_ROOT_DIR}/tmp`;
const LIBUSB_BOTTLE_TEMP_DIR = `${TEMP_ROOT_DIR}/libusb_cache`;
const BUILD_BASE_DIR = `${PKG_ROOT_DIR}/build`;
const KALAM_NATIVE_DIR = `${PKG_ROOT_DIR}/ffi/kalam/native`;

// find the brew bottle hashes here: https://github.com/Homebrew/homebrew-core/blob/master/Formula/libusb.rb
const LIBUSB_BREW_BOTTLES = {
  f9b75776c0b3b7fa44eb9876e4b102efdefffd432f019bc6a526e28d82eec991: {
    sha256: `f9b75776c0b3b7fa44eb9876e4b102efdefffd432f019bc6a526e28d82eec991`,
    arch: `arm64`,
    os: `darwin`,
    osName: `mac`,
    osVersion: `big_sur`,
    libusbVersion: `1.0.25`,
  },
  '1318e1155192bdaf7d159562849ee8f73cb0f59b0cb77c142f8be99056ba9d9e': {
    sha256: `e202da5a53b0955b4310805b09e9f4af3b73eed57de5ae0d44063e84dca5eafd`,
    arch: `amd64`,
    os: `darwin`,
    osName: `mac`,
    osVersion: `catalina`,
    libusbVersion: `1.0.25`,
  },
};

async function getCmd(cmd) {
  const op = await $`pwd`;

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
  const buildDir = `${BUILD_BASE_DIR}/${bottle.osName}/bin/${bottle.arch}`;
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

for await (let bottleKey of Object.keys(LIBUSB_BREW_BOTTLES)) {
  const bottle = LIBUSB_BREW_BOTTLES[bottleKey];
  const bottlePath = getLibusbBottleCachePath({ bottle });

  await $`curl -L -H "Authorization: Bearer QQ==" -o ${bottlePath.tarball} https://ghcr.io/v2/homebrew/core/libusb/blobs/sha256:${bottle.sha256}`;
}

// extracting the 'libusb' Brew bottles
console.info(`extracting the 'libusb' Brew bottles...\n`);

for await (let bottleKey of Object.keys(LIBUSB_BREW_BOTTLES)) {
  const bottle = LIBUSB_BREW_BOTTLES[bottleKey];
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

for await (let bottleKey of Object.keys(LIBUSB_BREW_BOTTLES)) {
  const bottle = LIBUSB_BREW_BOTTLES[bottleKey];
  const bottlePath = getLibusbBottleCachePath({ bottle });

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

  // copying the libusb-1.0.0.dylib to the build directory
  console.info(
    `[${bottlePath.identifier}] copying the libusb-1.0.0.dylib to the build directory...\n`
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

  // todo
  // strangely the `install_name_tool` command doesnt work on a macos monterey dylib file
  await $`install_name_tool -id ${bottlePath.rpath} ${bottlePath.libusbDylib}`;
}

await $`sleep 1`;

// building binairies
for await (let bottleKey of Object.keys(LIBUSB_BREW_BOTTLES)) {
  const bottle = LIBUSB_BREW_BOTTLES[bottleKey];
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

  // building kalam-debug-report
  console.info(`building kalam-debug-report...\n`);
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
