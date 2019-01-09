'use strict';
/**
 * handle image import into the program.
 * default path: ../public/images/
 * @param filePath
 * @returns {*}
 */
export const imgsrc = filePath => {
  return require('../images/' + filePath);
};
