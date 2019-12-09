'use strict';

import { variables, appThemeStyles, mixins } from '../../../styles/js';

// eslint-disable-next-line no-unused-vars
export const theme = ({ ...args }) => {
  const { appThemeMode } = args;
  console.info(appThemeMode);

  return {
    palette: {
      type: appThemeMode,
      primary: {
        ...appThemeStyles({ appThemeMode }).primaryColor
      },
      secondary: {
        ...appThemeStyles({ appThemeMode }).secondaryColor
      },
      background: {
        ...appThemeStyles({ appThemeMode }).background
      }
    },
    typography: {
      useNextVariants: true,
      fontSize: variables().regularFontSize,
      fontFamily: [
        'Roboto',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"'
      ].join(',')
    },

    overrides: {}
  };
};

// eslint-disable-next-line no-unused-vars
export const styles = args => {
  // eslint-disable-line no-unused-vars
  return {
    root: {},
    noProfileError: {
      textAlign: `center`,
      ...mixins().center,
      ...mixins().absoluteCenter
    }
  };
};
