'use strict';

const path = require('path');
const glob = require('glob');
const fs = require('fs-extra');

exports.default = context => {
  // clean languages unnecessary folder from packed app
  const lprojRegEx = /(en)\.lproj/g;
  const APP_NAME = context.packager.appInfo.productFilename;
  const APP_OUT_DIR = context.appOutDir;
  const PLATFORM = context.packager.platform.name;

  const cwd = path.join(`${APP_OUT_DIR}`, `${APP_NAME}.app/Contents/Resources`);
  const lproj = glob.sync('*.lproj', { cwd });
  const _promises = [];

  switch (PLATFORM) {
    case 'mac':
      lproj.forEach(dir => {
        if (!lprojRegEx.test(dir)) {
          _promises.push(fs.remove(path.join(cwd, dir)));
        }
      });

      break;
    default:
      break;
  }

  return Promise.all(_promises);
};
