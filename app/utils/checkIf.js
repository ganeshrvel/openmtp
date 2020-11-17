import { assert } from '@sindresorhus/is';
import { IS_PROD } from '../constants/env';

/**
 * description - Validate the types. In production mode the validation will be skipped
 *
 * @param value - variable
 * @param {'string'|'boolean'|'number'|'numericString'|'array'|'function'|'object'|'undefinedOrNull'|'undefined'|'null'} type - type to compare
 *
 * @return {boolean}
 */
export function checkIf(value, type) {
  if (IS_PROD) {
    return true;
  }

  if (type === 'string') {
    return assert.string(value);
  }

  if (type === 'boolean') {
    return assert.boolean(value);
  }

  if (type === 'number') {
    return assert.number(value);
  }

  if (type === 'numericString') {
    return assert.numericString(value);
  }

  if (type === 'array') {
    return assert.array(value);
  }

  if (type === 'function') {
    return assert.function(value);
  }

  if (type === 'object') {
    return assert.object(value);
  }

  if (type === 'undefinedOrNull') {
    return assert.null(value) || assert.undefined(value);
  }

  if (type === 'null') {
    return assert.null(value);
  }

  if (type === 'undefined') {
    return assert.undefined(value);
  }

  // eslint-disable-next-line no-throw-literal
  throw `invalid 'type' provided in 'checkIf'`;
}
