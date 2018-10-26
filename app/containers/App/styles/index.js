'use strict';

import { variables, mixins } from '../../../styles/js';

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

export const styles = args => {
  return {
    root: {},
    noProfileError: {
      textAlign: `center`,
      ...mixins().center,
      ...mixins().absoluteCenter
    }
  };
};
