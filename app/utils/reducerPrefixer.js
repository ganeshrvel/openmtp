'use strict';

export default function(prefix, typesList) {
  return typesList.reduce((result, value) => {
    result[value] = `${prefix}/${value}`;
    return result;
  }, {});
}
