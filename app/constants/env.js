'use strict';

/**
 * Constants
 * Note: Don't import log helper file from utils here
 */


export const IS_DEV = process.env.NODE_ENV !== 'production';
export const IS_PROD = process.env.NODE_ENV === 'production';
export const DEBUG_PROD = process.env.DEBUG_PROD === 'true';
