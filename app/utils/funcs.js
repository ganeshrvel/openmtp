'use strict';

export const isArraysEqual = (a, b) => {
  if (a === b) {
    return true;
  }
  if (a == null || b == null) {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
};

export const isInt = n => {
  if (typeof n !== 'number') {
    return false;
  }
  return Number(n) === n && n % 1 === 0;
};

export const isFloat = n => {
  if (typeof n !== 'number') {
    return false;
  }
  return Number(n) === n && n % 1 !== 0;
};

export const isNumber = n => {
  return typeof n === 'number';
};

export const isArray = n => {
  return Array.isArray(n);
};

export const niceBytes = (a, b) => {
  if (a === 0) {
    return '0 Bytes';
  }
  const c = 1024;
  const d = b || 2;
  const e = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const f = Math.floor(Math.log(a) / Math.log(c));
  return `${parseFloat((a / Math.pow(c, f)).toFixed(d))} ${e[f]}`; // eslint-disable-line no-restricted-properties
};

export const replaceBulk = (str, findArray, replaceArray) => {
  let i;
  let regex = [];
  const map = {};
  for (i = 0; i < findArray.length; i += 1) {
    regex.push(findArray[i].replace(/([-[\]{}()*+?.\\^$|#,])/g, '\\$1'));
    map[findArray[i]] = replaceArray[i];
  }
  regex = regex.join('|');
  return str.replace(new RegExp(regex, 'g'), matched => {
    return map[matched];
  });
};

export const splitIntoLines = str => {
  return str.split(/(\r?\n)/g);
};

export const quickHash = str => {
  let hash = 0;
  let i;
  let chr;

  if (str.length === 0) {
    return hash;
  }
  for (i = 0; i < str.length; i += 1) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr; // eslint-disable-line no-bitwise
    hash |= 0; // eslint-disable-line no-bitwise
  }
  return hash;
};

export const percentage = (current, total) => {
  return parseInt((current / total) * 100, 10);
};

export const truncate = (str, length) => {
  const dots = str.length > length ? '...' : '';
  return str.substring(0, length) + dots;
};

export const stripRootSlash = str => {
  return str.replace(/^\//g, '');
};

export const springTruncate = (str, minChars = 10, ellipsis = '...') => {
  const _str = str;
  const strLength = str.length;
  if (strLength > minChars) {
    const ellipsisLength = ellipsis.length;

    if (ellipsisLength > minChars) {
      return {
        text: _str,
        truncatedText: str.substr(strLength - minChars),
        isTruncated: true
      };
    }

    const count = -0.5 * (minChars - strLength - ellipsisLength);
    const center = strLength / 2;

    return {
      text: _str,
      truncatedText: `${str.substr(0, center - count)}${ellipsis}${str.substr(
        strLength - center + count
      )}`,
      isTruncated: true
    };
  }

  return {
    text: _str,
    truncatedText: str,
    isTruncated: false
  };
};

export const undefinedOrNull = _var => {
  return typeof _var === 'undefined' || _var === null;
};

/**
 * Chained object validator
 * Validates the chained object values
 * @returns {{encode: string, decode: string}}
 * @param mainObj: object or array
 * @param key: string
 */
export const undefinedOrNullChained = (mainObj, key = null) => {
  const _return = undefined;

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

  const keyArray = key.split('.');

  if (!keyArray || keyArray.length < 1) {
    return _return;
  }
  let temp = mainObj;

  keyArray.map(a => {
    if (typeof temp !== 'undefined') {
      const _matches = a.match(/[^[\]]+(?=])/g);

      if (_matches && _matches.length > 0) {
        const aSplits = a.split('[')[0];
        let lTemp = temp[aSplits];

        _matches.map(e => {
          if (typeof lTemp !== 'undefined' && typeof lTemp[e] !== 'undefined') {
            lTemp = lTemp[e];
            return lTemp;
          }
          lTemp = undefined;

          return lTemp;
        });
        temp = lTemp;

        return temp;
      }
      if (typeof temp[a] !== 'undefined') {
        temp = temp[a];
        return temp;
      }
    }

    temp = _return;

    return temp;
  });

  return typeof temp !== 'undefined' ? temp : _return;
};

export const diffObj = (obj1, obj2) => {
  let isSame = true;
  // eslint-disable-next-line no-restricted-syntax
  for (const p in obj1) {
    if (typeof obj1[p] === 'object') {
      const objectValue1 = obj1[p];
      const objectValue2 = obj2[p];
      // eslint-disable-next-line no-restricted-syntax, guard-for-in
      for (const value in objectValue1) {
        isSame = diffObj(objectValue1[value], objectValue2[value]);
        if (isSame === false) {
          return false;
        }
      }
    } else if (obj1 !== obj2) {
      isSame = false;
    }
  }
  return isSame;
};
