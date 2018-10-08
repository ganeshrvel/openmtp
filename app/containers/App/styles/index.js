'use strict';

import { base } from '../../../styles/js';
const { variables } = base();

export const theme = args => {
  return {
    palette: {
      primary: {
        main: '#ffffff'
      },
      secondary: {
        main: '#007af5'
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
    appContainer: {}
  };
};
