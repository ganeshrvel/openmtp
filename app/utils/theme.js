import { APP_THEME_COLOR_KEY } from '../constants/theme';

export const getAppCssColorVar = () => {
  const colorVarList = {};

  Object.keys(APP_THEME_COLOR_KEY).map((a) => {
    const value = APP_THEME_COLOR_KEY[a];

    colorVarList[a] = `var(${value})`;

    return a;
  });

  return colorVarList;
};
