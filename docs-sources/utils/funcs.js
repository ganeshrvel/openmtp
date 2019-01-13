'use strict';

/* eslint global-require: off, import/no-dynamic-require: 0, prefer-template: 0 */

import { ALLOWED_GITHUB_FETCH_STATUSES } from './consts';

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
      if (ALLOWED_GITHUB_FETCH_STATUSES.indexOf(res.status) !== -1) {
        return {
          json: res.json(),
          status: res.status
        };
      }

      return null;
    })
    .catch(() => {});
};

export const imageLoaded = src => {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve({ src, status: 'ok' });
    img.onerror = () => resolve({ src, status: 'error' });

    img.src = src;
  });
};

export const urls = {
  get({ param = '', url = '' }) {
    const data = {};
    if (url === '') {
      url = window.location.href; // eslint-disable-line no-param-reassign
    }

    url.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
      data[key] = decodeURI(value);
    });

    if (param === '') {
      return data;
    }
    if (typeof data[param] === 'undefined') {
      return null;
    }
    return data[param];
  },

  getUrlWithoutHash({ url = '' }) {
    if (url !== '') {
      const hash = url.split('#')[0];
      if (hash) {
        return hash;
      }
      return null;
    }
    return window.location.href.split('#')[0];
  },

  getHash({ url = '' }) {
    if (url !== '') {
      const hash = url.split('#')[1];
      if (hash) {
        return hash;
      }
      return null;
    }
    return location.hash.replace('#', '').trim(); // eslint-disable-line no-restricted-globals
  },

  parseHash({ param = '', url = '' }) {
    let urlDATA = '';
    if (url !== '') {
      urlDATA = url;
    }
    const hash = urls.getHash({ url: urlDATA });
    if (hash === '') {
      return null;
    }
    const pieces = hash.split('&');
    const data = {};
    let i;
    let parts;
    for (i = 0; i < pieces.length; i += 1) {
      parts = pieces[i].split('=');
      if (parts.length < 2) {
        parts.push('');
      }
      data[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
    }
    if (param === '') {
      return data;
    }
    if (typeof data[param] === 'undefined') {
      return null;
    }
    return data[param];
  },

  removeHash() {
    window.location.replace('#');
  },

  getUrlPath() {
    return window.location.pathname;
  }
};
