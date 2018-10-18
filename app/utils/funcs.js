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

  for (let i = 0; i < a.length; ++i) {
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

export const niceBytes = (a, b) => {
  if (0 === a) {
    return '0 Bytes';
  }
  const c = 1024,
    d = b || 2,
    e = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    f = Math.floor(Math.log(a) / Math.log(c));
  return parseFloat((a / Math.pow(c, f)).toFixed(d)) + ' ' + e[f];
};

export const replaceBulk = (str, findArray, replaceArray) => {
  let i,
    regex = [],
    map = {};
  for (i = 0; i < findArray.length; i++) {
    regex.push(findArray[i].replace(/([-[\]{}()*+?.\\^$|#,])/g, '\\$1'));
    map[findArray[i]] = replaceArray[i];
  }
  regex = regex.join('|');
  str = str.replace(new RegExp(regex, 'g'), function(matched) {
    return map[matched];
  });
  return str;
};
