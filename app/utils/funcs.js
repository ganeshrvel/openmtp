import { isObject } from 'nice-utils';
import semver from 'semver';
import { APP_TITLEBAR_DOM_ID } from '../constants/dom';
import { APP_VERSION } from '../constants/meta';

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

export const isInt = (n) => {
  if (typeof n !== 'number') {
    return false;
  }

  return Number(n) === n && n % 1 === 0;
};

export const isFloat = (n) => {
  if (typeof n !== 'number') {
    return false;
  }

  return Number(n) === n && n % 1 !== 0;
};

export const isNumber = (n) => {
  return typeof n === 'number';
};

export const isArray = (n) => {
  return Array.isArray(n);
};

/**
 *
 * @param arr {[]} - array
 * @param n {any} - search
 * @return {boolean}
 */
export const inArray = (arr, n) => {
  return arr.includes(n);
};

export const niceBytes = (a, b) => {
  if (a === 0) {
    return '0 Bytes';
  }

  const c = 1024;
  const d = b || 2;
  const e = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const f = Math.floor(Math.log(a) / Math.log(c));

  return `${parseFloat((a / c ** f).toFixed(d))} ${e[f]}`; // eslint-disable-line no-restricted-properties
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

  return str.replace(new RegExp(regex, 'g'), (matched) => {
    return map[matched];
  });
};

export const splitIntoLines = (str) => {
  if (undefinedOrNull(str)) {
    return null;
  }

  return str.toString().split(/(\r?\n)/g);
};

export const quickHash = (str) => {
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

export const stripRootSlash = (str) => {
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
        isTruncated: true,
      };
    }

    const count = -0.5 * (minChars - strLength - ellipsisLength);
    const center = strLength / 2;

    return {
      text: _str,
      truncatedText: `${str.substr(0, center - count)}${ellipsis}${str.substr(
        strLength - center + count
      )}`,
      isTruncated: true,
    };
  }

  return {
    text: _str,
    truncatedText: _str,
    isTruncated: false,
  };
};

export const undefinedOrNull = (_var) => {
  return typeof _var === 'undefined' || _var === null;
};

export const isEmpty = (x) => {
  if (undefinedOrNull(x)) {
    return true;
  }

  if (isObject(x) && Object.keys(x).length < 1) {
    return true;
  }

  return x.length < 1;
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

export const arrayEquality = (array1, array2) => {
  return (
    array1.length === array2.length &&
    array1.sort().every((value, index) => {
      return value === array2.sort()[index];
    })
  );
};

export const arrayIntersection = (array1, array2) => {
  return array1.filter((element) => array2.includes(element));
};

export const keymapSearch = (keymap, keyedList) => {
  return Object.keys(keymap).find((a) => {
    const item = keymap[a];

    return arrayEquality(item, keyedList);
  });
};

export const toggleFileExplorerDeviceType = (
  currentDeviceType,
  DEVICE_TYPE
) => {
  return currentDeviceType === DEVICE_TYPE.local
    ? DEVICE_TYPE.mtp
    : DEVICE_TYPE.local;
};

export const isFileExplorerOnFocus = () => {
  return document.elementFromPoint(3, 2).id === APP_TITLEBAR_DOM_ID;
};

export const isString = (variable) => {
  return typeof variable === 'string' || variable instanceof String;
};

export const removeArrayDuplicates = (array) => {
  return array.filter((v, i) => array.indexOf(v) === i);
};

export const getPluralText = (string, count, customPluralString = null) => {
  if (count > 1) {
    if (customPluralString) {
      return customPluralString;
    }

    return `${string}s`;
  }

  return string;
};

export const asserts = (condition, message) => {
  if (condition) {
    return;
  }

  throw message || 'Assertion failed';
};

export const capitalize = (s) => {
  if (isEmpty(s)) {
    return '';
  }

  if (typeof s !== 'string') {
    return '';
  }

  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const arrayAverage = (array) => {
  if (isEmpty(array)) {
    return 0;
  }

  return array.reduce((a, b) => a + b) / array.length;
};

export const isPrereleaseVersion = () => {
  return !!semver.prerelease(APP_VERSION);
};
