'use strict';

let _isPackaged = false;

if (
  process.mainModule &&
  process.mainModule.filename.indexOf('app.asar') !== -1
) {
  _isPackaged = true;
}

export const isPackaged = _isPackaged;
