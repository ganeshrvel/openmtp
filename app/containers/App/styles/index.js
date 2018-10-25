'use strict';

import { base } from '../../../styles/js';
const { variables } = base();

export const theme = args => {
  return {
    palette: {
      primary: {
        ...variables.styles.primaryColor
      },
      secondary: {
        ...variables.styles.secondaryColor
      }
    },
    typography: {
      useNextVariants: true,
      fontSize: variables.regularFontSize,
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
    appContainer: {},
    noProfileError: {
      textAlign: `center`,
      ...variables.mixins.center,
      ...variables.mixins.absoluteCenter
    }
  };
};
