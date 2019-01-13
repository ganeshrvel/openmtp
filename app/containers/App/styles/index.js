'use strict';

import { variables, mixins } from '../../../styles/js';

// eslint-disable-next-line no-unused-vars
export const theme = args => {
  return {
    palette: {
      primary: {
        ...variables().styles.primaryColor
      },
      secondary: {
        ...variables().styles.secondaryColor
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
