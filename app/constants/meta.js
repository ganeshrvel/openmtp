'use strict';

/**
 * Constants
 * Note: Don't import log helper file from utils here
 */

import {
  productName,
  description,
  name,
  author,
  version
} from '../../package.json';

export const APP_NAME = `${productName}`;

export const APP_VERSION = `${version}`;

export const AUTHOR_EMAIL = `${author.email}`;

export const APP_TITLE = `${description}`;

export const APP_IDENTIFIER = `${name}`;
