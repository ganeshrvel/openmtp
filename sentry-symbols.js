#!/usr/bin/env node

/* eslint-disable global-require */

let SentryCli;
let download;

try {
  SentryCli = require('@sentry/cli');
  download = require('electron-download');
} catch (e) {
  console.error('ERROR: Missing required packages, please run:');
  console.error('npm install --save-dev @sentry/cli electron-download');
  process.exit(1);
}

const VERSION = /\bv?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[\da-z-]+(?:\.[\da-z-]+)*)?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?\b/i;
const SYMBOL_CACHE_FOLDER = '.electron-symbols';
const _package = require('./package.json');

const sentryCli = new SentryCli('./sentry.properties');

async function main() {
  const version = getElectronVersion();

  if (!version) {
    console.error('Cannot detect electron version, check package.json');

    return;
  }

  console.info('We are starting to download all possible electron symbols');
  console.info('We need it in order to symbolicate native crashes');
  console.info(
    'This step is only needed once whenever you update your electron version'
  );
  console.info('Just call this script again it should do everything for you.');

  let zipPath = await downloadSymbols({
    version,
    platform: 'darwin',
    arch: 'x64',
    dsym: true,
  });

  await sentryCli.execute(['upload-dif', '-t', 'dsym', zipPath], true);

  zipPath = await downloadSymbols({
    version,
    platform: 'win32',
    arch: 'ia32',
    symbols: true,
  });
  await sentryCli.execute(['upload-dif', '-t', 'breakpad', zipPath], true);

  zipPath = await downloadSymbols({
    version,
    platform: 'win32',
    arch: 'x64',
    symbols: true,
  });
  await sentryCli.execute(['upload-dif', '-t', 'breakpad', zipPath], true);

  zipPath = await downloadSymbols({
    version,
    platform: 'linux',
    arch: 'x64',
    symbols: true,
  });
  await sentryCli.execute(['upload-dif', '-t', 'breakpad', zipPath], true);

  console.info('Finished downloading and uploading to Sentry');
  console.info(`Feel free to delete the ${SYMBOL_CACHE_FOLDER}`);
}

function getElectronVersion() {
  if (!_package) {
    return false;
  }

  const electronVersion =
    (_package.dependencies && _package.dependencies.electron) ||
    (_package.devDependencies && _package.devDependencies.electron);

  if (!electronVersion) {
    return false;
  }

  const matches = VERSION.exec(electronVersion);

  return matches ? matches[0] : false;
}

async function downloadSymbols(options) {
  return new Promise((resolve, reject) => {
    download(
      {
        ...options,
        cache: SYMBOL_CACHE_FOLDER,
      },
      (err, zipPath) => {
        if (err) {
          reject(err);
        } else {
          resolve(zipPath);
        }
      }
    );
  });
}

main().catch((e) => console.error(e));
