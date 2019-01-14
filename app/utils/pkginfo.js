'use strict';

const fs = require('fs');
const path = require('path');

module.exports.pkginfo = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), './package.json'), 'utf8')
);
