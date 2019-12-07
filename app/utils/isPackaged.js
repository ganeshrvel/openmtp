'use strict';

let _isPackaged = false;

if (
  process.mainModule &&
  process.mainModule.filename.indexOf('app.asar') !== -1
) {
  _isPackaged = true;
} else if (process.argv.filter(a => a.indexOf('app.asar') !== -1).length > 1) {
  _isPackaged = true;
}

export const isPackaged = _isPackaged;
