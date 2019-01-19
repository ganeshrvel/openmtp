'use strict';

export const isPackaged =
  process.mainModule.filename.indexOf('app.asar') !== -1;
