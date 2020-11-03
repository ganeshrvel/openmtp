import { isString } from './funcs';

export const setStyle = (selector, styles) => {
  let elem;

  if (isString(selector)) {
    elem = document.querySelector(selector);
  } else {
    elem = selector;
  }

  if (!elem) {
    return;
  }

  let styleString = '';

  Object.keys(styles).map((a) => {
    const item = styles[a];
    styleString += `${a}:${item};`;

    return a;
  });

  elem.setAttribute('style', styleString);
};
