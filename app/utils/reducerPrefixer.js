'use strict';

export default function(prefix, typesList) {
  return typesList.reduce((result, value) => {
    // eslint-disable-next-line no-param-reassign
    result[value] = `${prefix}/${value}`;
    return result;
  }, {});
}
