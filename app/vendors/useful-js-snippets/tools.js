/**
 * License: MIT
 * Author: Ganesh Rathinavel
 * Requirements: es6, javascript enabled browser or node.js
 * Version: 1.2
 */

//####################################################################################################

/**
 * Move an array key-value pair to another index.
 * @param oldIndex
 * @param newIndex
 * @returns {Array}
 */

Array.prototype.move = function(oldIndex, newIndex) {
  while (oldIndex < 0) {
    oldIndex += this.length;
  }
  while (newIndex < 0) {
    newIndex += this.length;
  }
  if (newIndex >= this.length) {
    let k = newIndex - this.length;
    while (k-- + 1) {
      this.push(undefined);
    }
  }
  this.splice(newIndex, 0, this.splice(oldIndex, 1)[0]);
  return this;
};

//####################################################################################################

/**
 * Wait for an image to load.
 * @param src
 * @returns {Promise<any>}
 */
function imageLoaded(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve({ src: src, status: 'ok' });
    img.onerror = () => resolve({ src: src, status: 'error' });

    img.src = src;
  });
}

//####################################################################################################

/**
 * Get the actual width of an element; It takes the styles of its children into consideration;
 * Total width: width + margin - padding + border
 * @param selector => id or class name
 * @returns {*}
 */

function getNetElementWidth(selector) {
  let elem = document.querySelectorAll(selector),
    total = 0;

  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return null;
  }

  elem &&
    Object.keys(elem).length > 0 &&
    Object.keys(elem).forEach(i => {
      let style = elem[i].currentStyle || window.getComputedStyle(elem[i]),
        width = elem[i].offsetWidth,
        margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight),
        padding =
          parseFloat(style.paddingLeft) + parseFloat(style.paddingRight),
        border =
          parseFloat(style.borderLeftWidth) +
          parseFloat(style.borderRightWidth);
      total += width + margin - padding + border;
    });
  return total;
}

//####################################################################################################

/**
 * Generates a lengthy random number
 * @returns {number}
 */
function rand() {
  return Math.floor(Math.random() * Date.now()) + Date.now();
}

//####################################################################################################

/**
 * Strip HTML Tags from an input string
 * @param input; string
 * @param allowed; <img> or <span><body>
 * @returns {string}
 */
function stripTags(input = '', allowed = '') {
  allowed = (
    ((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []
  ).join('');
  let tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  let commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
  return input.replace(commentsAndPhpTags, '').replace(tags, function($0, $1) {
    return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
  });
}

//####################################################################################################

/**
 * Replace all occurrences of a sub-string
 * @param str
 * @param find
 * @param replace
 * @returns {string | void | *}
 */
function replaceAll(str, find, replace) {
  return str.replace(
    new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi'),
    replace
  );
}

//####################################################################################################

/**
 * URL Sanitizer
 * Encodes and decodes url parameters
 * @param str
 * @returns {{encode: string, decode: string}}
 */
function urlSanitizer(str) {
  if (!str) {
    str = '';
  }
  return {
    encode: encodeURIComponent(str.replace(/\\\//g, '')).replace(/%20/g, '+'),
    decode: decodeURIComponent(str.replace(/\+/g, '%20'))
  };
}

//####################################################################################################/**

/**
 * Chained object validator
 * Validates the chained object values
 * @returns {{encode: string, decode: string}}
 * @param mainObj: object or array
 * @param key: string
 */
function chainValidator(mainObj, key = null) {
  let _return = undefined;

  if (typeof mainObj === 'undefined' || !mainObj) {
    return _return;
  }

  if (
    !key ||
    (Object.prototype.toString.call(key) !== '[object String]' &&
      key.trim() === '')
  ) {
    return _return;
  }

  let keyArray = key.split('.');

  if (!keyArray || keyArray.length < 1) {
    return _return;
  }
  let temp = mainObj;

  keyArray.map(a => {
    if (typeof temp !== 'undefined') {
      let _matches = a.match(/[^[\]]+(?=])/g);

      if (_matches && _matches.length > 0) {
        let aSplits = a.split('[')[0],
          lTemp = temp[aSplits];

        _matches.map(e => {
          if (typeof lTemp !== 'undefined' && typeof lTemp[e] !== 'undefined') {
            return (lTemp = lTemp[e]);
          }
          lTemp = undefined;
        });
        return (temp = lTemp);
      } else if (typeof temp[a] !== 'undefined') {
        return (temp = temp[a]);
      }
    }

    temp = _return;
  });

  return typeof temp !== 'undefined' ? temp : _return;
}

//####################################################################################################

/**
 * Return numeric value from the input string
 * @param number
 * @param allowDecimal
 * @param pattern
 * @returns Number
 */
function onlyNumber(number = null, allowDecimal = false, pattern = /[^1-9]/g) {
  if (!isNaN(number)) {
    return number;
  }
  if (allowDecimal) {
    pattern = /[^1-9.]/g;
  }
  return number.replace(new RegExp(pattern, 'gi'), '');
}

//####################################################################################################

/**
 * Array to Object
 * @param array
 * @returns {{}}
 */
function toObject(array) {
  if (typeof array === 'undefined' || !array || array.length < 1) {
    return {};
  }
  let k = {};
  for (let i = 0; i < array.length; ++i) {
    if (array[i] !== undefined) {
      k[i] = array[i];
    }
  }
  return k;
}

//####################################################################################################

/**
 * Strip a character from the beginning and end of the string
 * @param string
 * @param search
 */
function rtrim(string, search = '') {
  string = string.toString();
  if (typeof string === 'undefined' || string === null) {
    return '';
  }
  if (search === '') {
    return string.trim();
  }
  let regex = new RegExp('^' + search + '+|' + search + '+$', 'g');
  return string.replace(regex, '').trim();
}

//####################################################################################################

/**
 * Get/Manipulate URL, URI parameters or hashes.
 *
 * get: returns parameter(s) in a url as an object; if url is empty current url is considered; if param is empty all url parameters are returned as an object
 * getUrlWithoutHash: strips hash and return url; if url is empty current url is considered;
 * getHash: returns the hash value of an url as an object; if url is empty current url is considered;
 * parseHash: parses and returns multiple hash values of an url as an object; if url is empty current url is considered; if param is empty all url parameters are returned as an object
 * removeHash: remove hash from the address bar url
 * getUrlPath: get url location pathname
 *
 * @type {{get({param?: *, url?: *}): *, getUrlWithoutHash({url?: *}): *, getHash: urls.getHash, parseHash({param?: *, url?: *}): *, removeHash(): void, getUrlPath(): *}}
 */

let urls = {
  get({ param = '', url = '' }) {
    let data = {};
    if (url === '') {
      url = window.location.href;
    }
    url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
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
      let hash = url.split('#')[0];
      if (hash) {
        return hash;
      } else {
        return null;
      }
    }
    return window.location.href.split('#')[0];
  },

  getHash({ url = '' }) {
    if (url !== '') {
      let hash = url.split('#')[1];
      if (hash) {
        return hash;
      } else {
        return null;
      }
    }
    return location.hash.replace('#', '').trim();
  },

  parseHash({ param = '', url = '' }) {
    let urlDATA = '';
    if (url !== '') {
      urlDATA = url;
    }
    let hash = urls.getHash({ url: urlDATA });
    if (hash === '') {
      return null;
    }
    let pieces = hash.split('&'),
      data = {},
      i,
      parts;
    for (i = 0; i < pieces.length; i++) {
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

//####################################################################################################

/**
 * Sanitize html tags
 * escapes and unescapes html tags
 *
 * @param str
 * @returns {{escape: string, unescape: string}}
 */
function htmlSanitize(str = '') {
  return {
    escape: str
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;'),

    unescape: str
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
  };
}

//####################################################################################################

/**
 * Check if the device is touch enabled
 *
 * @returns {boolean}
 */
function isTouchDevice() {
  return 'ontouchstart' in window || navigator.msMaxTouchPoints > 0;
}

//####################################################################################################

/**
 * Detecting iOS
 *
 * @returns {boolean}
 */
function isiOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

//####################################################################################################
/**
 * Check whether the given variable is a function
 *
 * @param fn
 * @returns {*|boolean}
 */
function isFunction(fn) {
  let getType = {};
  return fn && getType.toString.call(fn) === '[object Function]';
}

//####################################################################################################
/**
 * Check whether the input variable is an Array
 *
 * @param arr
 * @returns {arg is Array<any>}
 */
function isArray(arr) {
  if (!Array.isArray) {
    Array.isArray = arg => {
      return Object.prototype.toString.call(arg) === '[object Array]';
    };
  }
  return Array.isArray(arr);
}

//####################################################################################################
/**
 * Check whether the input variable is an Object
 *
 * @param obj
 * @returns {boolean}
 */
function isObject(obj) {
  if (obj === null) {
    return false;
  }
  return typeof obj === 'function' || typeof obj === 'object';
}

//####################################################################################################
/**
 * Check whether the input variable is an String
 *
 * @param str
 * @returns {boolean}
 */
function isString(str) {
  return Object.prototype.toString.call(str) !== '[object String]';
}

//####################################################################################################
/**
 * Check whether the variable is a JSON Object
 *
 * @param string
 * @returns {*}
 */
function isJSON(string) {
  if (typeof string !== 'string') {
    string = JSON.stringify(string);
  }

  try {
    let o = JSON.parse(string);
    if (o && typeof o === 'object') {
      return o;
    }
  } catch (e) {}

  return false;
}

//####################################################################################################

/**
 * Change the url hash in the address bar and push the same into the browser history
 *
 * @param param
 */
function changeURLHash(param) {
  if (param === 'undefined' || param == null) {
    param = '';
  } else {
    param = '#' + param;
  }
  let scrollV,
    scrollH,
    loc = window.location;
  if ('pushState' in history) {
    history.pushState('', document.title, loc.pathname + loc.search + param);
  } else {
    scrollV = document.body.scrollTop;
    scrollH = document.body.scrollLeft;
    loc.hash = param;
    document.body.scrollTop = scrollV;
    document.body.scrollLeft = scrollH;
  }
}

//####################################################################################################

/**
 * Wait for a DOM element to load.
 *
 * @param selector: eg: input#id
 * @param time, time interval
 * @returns Promise
 */
let waitForElementLoad = ({ selector, time = 500 }) => {
  return new Promise((resolve, reject) => {
    if (typeof selector === 'undefined' || selector === null) {
      return reject(null);
    }

    let _interval = setInterval(() => {
      if (document.querySelector(selector) != null) {
        clearInterval(_interval);
        return resolve(document.querySelector(selector));
      }
    }, time);
  });
};

//####################################################################################################

module.exports.move = Array.prototype.move;
module.exports.imageLoaded = imageLoaded;
module.exports.getNetElementWidth = getNetElementWidth;
module.exports.rand = rand;
module.exports.stripTags = stripTags;
module.exports.replaceAll = replaceAll;
module.exports.urlSanitizer = urlSanitizer;
module.exports.chainValidator = chainValidator;
module.exports.onlyNumber = onlyNumber;
module.exports.toObject = toObject;
module.exports.rtrim = rtrim;
module.exports.urls = urls;
module.exports.htmlSanitize = htmlSanitize;
module.exports.isTouchDevice = isTouchDevice;
module.exports.isiOS = isiOS;
module.exports.isFunction = isFunction;
module.exports.isArray = isArray;
module.exports.isObject = isObject;
module.exports.isString = isString;
module.exports.isJSON = isJSON;
module.exports.changeURLHash = changeURLHash;
module.exports.waitForElementLoad = waitForElementLoad;
