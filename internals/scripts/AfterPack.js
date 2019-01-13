'use strict';

const path = require('path');
const glob = require('glob');
const fs = require('fs-extra');

// eslint-disable-next-line func-names
exports.default = function(context) {
  // clean languages unnecessary folder from packed app
  const lprojRegEx = /(en)\.lproj/g;
  const cwd = path.join(
    context.appOutDir,
    `${context.packager.appInfo.productFilename}.app/Contents/Resources`
  );
  const lproj = glob.sync('*.lproj', { cwd });
  const _promises = [];

  switch (context.packager.platform.name) {
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
