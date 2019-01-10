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

export const fetchUrl = ({ url }) => {
  return fetch(`${url}`)
    .then(res => {
      if (res.status === 200) {
        return res.json();
      }
      return null;
    })
    .catch(e => {});
};

export const imageLoaded = src => {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve({ src: src, status: 'ok' });
    img.onerror = () => resolve({ src: src, status: 'error' });

    img.src = src;
  });
};
