'use strict';

export function fetchUrl({ url }) {
  return fetch(`${url}`).then(res => {
    if (res.status === 200) {
      return res.json();
    }
    return null;
  });
}
