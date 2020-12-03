import { assert } from '@sindresorhus/is';
import { IS_PROD } from '../constants/env';
import { inArray } from './funcs';

/**
 * description - Assert a value. In production mode the validation will be skipped
 *
 * @param value - variable
 * @param {'string'|'boolean'|'number'|'numericString'|'array'|'function'|'object'|'undefinedOrNull'|'undefined'|'null'|'inArray'|'inObjectValues'} condition - condition to compare
 * @param comparator - Comparator
 *
 * @return {boolean}
 */
export function checkIf(value, condition, comparator) {
  if (IS_PROD) {
    return true;
  }

  if (condition === 'string') {
    return assert.string(value);
  }

  if (condition === 'boolean') {
    return assert.boolean(value);
  }

  if (condition === 'number') {
    return assert.number(value);
  }

  if (condition === 'numericString') {
    return assert.numericString(value);
  }

  if (condition === 'array') {
    return assert.array(value);
  }

  if (condition === 'function') {
    return assert.function(value);
  }

  if (condition === 'object') {
    return assert.object(value);
  }

  if (condition === 'undefinedOrNull') {
    return assert.null(value) || assert.undefined(value);
  }

  if (condition === 'null') {
    return assert.null(value);
  }

  if (condition === 'undefined') {
    return assert.undefined(value);
  }

  if (condition === 'inArray') {
    if (!inArray(comparator, value)) {
      throw `'assert' failed for condition=inArray`;
    }

    return true;
  }

  if (condition === 'inObjectValues') {
    if (assert.object(comparator)) {
      return false;
    }

    if (!inArray(Object.values(comparator), value)) {
      throw `'assert' failed for condition=inObjectValues`;
    }

    return true;
  }

  // eslint-disable-next-line no-throw-literal
  throw `invalid 'condition' provided in 'checkIf'`;
}
