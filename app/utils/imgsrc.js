'use strict';

/* eslint global-require: off, prefer-template: off */

/**
 * handle image import into the program.
 * default path: ../public/images/
 * @param filePath
 * @param returnNoImageFound (optional)
 * @returns {*}
 */
export const imgsrc = (filePath, returnNoImageFound = true) => {
  try {
    return require('../public/images/' + filePath);
  } catch (e) {
    if (!returnNoImageFound) {
      return null;
    }
    return require('../public/images/no-image.png');
  }
};
