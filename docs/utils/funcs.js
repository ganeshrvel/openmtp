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

export const undefinedOrNull = _var => {
  return typeof _var === 'undefined' || _var === null;
};

export function fetchUrl({ url }) {
  return fetch(`${url}`).then(res => {
    if (res.status === 200) {
      return res.json();
    }
    return null;
  });
}
