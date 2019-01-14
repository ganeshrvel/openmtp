'use strict';

let _pkginfo = {};

// eslint-disable-next-line no-undef
if (typeof PKG_INFO !== 'undefined' && PKG_INFO !== null) {
  // eslint-disable-next-line no-undef
  _pkginfo = PKG_INFO;
} else {
  _pkginfo = {
    version: process.env.npm_package_version,
    productName: process.env.npm_package_productName,
    description: process.env.npm_package_description,
    name: process.env.npm_package_name,
    author: {
      name: process.env.npm_package_author_name,
      email: process.env.npm_package_author_email
    },
    repository: {
      url: process.env.npm_package_repository_url
    },
    homepage: process.env.npm_package_homepage
  };
}

export const pkginfo = _pkginfo;
