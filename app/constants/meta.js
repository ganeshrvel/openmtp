'use strict';

/**
 * Constants
 * Note: Don't import log helper file from utils here
 */

import { pkginfo } from '../utils/pkginfo';

const {
  productName,
  description,
  name,
  author,
  version,
  repository,
  homepage
} = pkginfo;

export const APP_NAME = `${productName}`;

export const APP_VERSION = `${version}`;

export const AUTHOR_EMAIL = `${author.email}`;

export const APP_TITLE = `${description}`;

export const APP_IDENTIFIER = `${name}`;

export const APP_GITHUB_URL = repository.url.replace(/^git\+|\.git/g, '');

export const APP_GITHUB_RELEASES_URL = `${APP_GITHUB_URL}/releases`;

export const APP_WEBSITE = `${homepage}`;
