'use strict';

import { isNumber, isString } from 'util';

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

export const doSort = ({ field, reverse, primer }) => {
  let key = x => {
    const item = x[field];

    if (typeof item === 'undefined' || item === null) {
      return null;
    }

    let _primer = null;

    if (isNumber(item)) {
      if (isInt(item)) {
        _primer = parseInt(item);
      } else if (isFloat) {
        _primer = parseFloat(item);
      }
    }

    if (_primer === null) {
      _primer = primer(item);
    }

    return primer ? _primer : item;
  };

  return (a, b) => {
    let A = key(a),
      B = key(b);
    return (A < B ? -1 : A > B ? 1 : 0) * [-1, 1][+!!reverse];
  };
};
