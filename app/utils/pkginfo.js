'use strict';

import { join } from 'path';
import { readFileSync } from 'fs';
import { rootPath } from 'electron-root-path';

let _pkginfo = {};

// eslint-disable-next-line no-undef
if (typeof PKG_INFO !== 'undefined' && PKG_INFO !== null) {
  // eslint-disable-next-line no-undef
  _pkginfo = PKG_INFO;
} else {
  _pkginfo = JSON.parse(
    readFileSync(join(rootPath, 'package.json'), { encoding: 'utf8' })
  );
}

export const pkginfo = _pkginfo;
