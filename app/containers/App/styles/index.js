import { variables, mixins } from '../../../styles/js';

// Styles for App/index.jsx component
export const styles = (theme) => {
  return {
    root: {},
    noProfileError: {
      textAlign: `center`,
      ...mixins({ theme }).center,
      ...mixins({ theme }).absoluteCenter,
    },
  };
};

export const getColorPalette = () => {
  const lightPrimaryColor = '#fff';
  const lightSecondaryColor = '#007af5';

  const darkPrimaryColor = '#242424';
  const darkSecondaryColor = '#007af5';

  return {
    get light() {
      return {
        primary: {
          main: lightPrimaryColor,
          contrastText: '#000',
        },
        secondary: {
          main: lightSecondaryColor,
          contrastText: '#fff',
        },
        background: {
          default: darkPrimaryColor,
          paper: lightPrimaryColor,
        },
        btnTextColor: '#fff',
        fileColor: '#000',
        tableHeaderFooterBgColor: `#fbfbfb`,
        lightText1Color: `rgba(0, 0, 0, 0.50)`,
        fileExplorerThinLineDividerColor: `rgba(0, 0, 0, 0.12)`,
        fileDrop: `rgba(0, 122, 245, 0.08)`,
        disabledBgColor: `#f3f3f3`,
        nativeSystemColor: `#ececec`,
        contrastPrimaryMainColor: darkPrimaryColor,
      };
    },
    get dark() {
      return {
        primary: {
          main: darkPrimaryColor,
          contrastText: '#fff',
        },
        secondary: {
          main: darkSecondaryColor,
          contrastText: '#fff',
        },
        background: {
          default: darkPrimaryColor,
          paper: darkPrimaryColor,
        },
        text: {
          primary: '#fff',
          secondary: 'rgba(255, 255, 255, 0.65)',
          disabled: 'rgba(255, 255, 255, 0.4)',
        },
        action: {
          active: 'rgba(255, 255, 255, 0.65)',
          hover: 'rgba(255, 255, 255, 0.2)',
          selected: 'rgba(255, 255, 255, 0.16)',
          disabled: 'rgba(255, 255, 255, 0.3)',
          disabledBackground: 'rgba(255, 255, 255, 0.12)',
        },
        divider: `rgba(255, 255, 255, 0.12)`,
        btnTextColor: '#fff',
        fileColor: '#d5d5d5',
        tableHeaderFooterBgColor: `#313131`,
        lightText1Color: `rgba(255, 255, 255, 0.50)`,
        fileExplorerThinLineDividerColor: `rgba(255, 255, 255, .12)`,
        fileDrop: `rgba(0, 122, 245, 0.08)`,
        disabledBgColor: `rgba(255, 255, 255, 0.15)`,
        nativeSystemColor: `#323232`,
        contrastPrimaryMainColor: lightPrimaryColor,
      };
    },
  };
};

export const getCurrentThemePalette = (appThemeMode) => {
  return getColorPalette()[appThemeMode];
};

export const materialUiTheme = ({ ...args }) => {
  const { appThemeMode } = args;

  const palette = getCurrentThemePalette(appThemeMode);

  return {
    palette: {
      ...palette,
    },
    typography: {
      useNextVariants: true,
      fontSize: variables().sizes.regularFontSize,
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
        '"Segoe UI Symbol"',
      ].join(','),
    },

    overrides: {
      MuiCssBaseline: {
        '@global': {
          html: {
            '--app-bg-color': palette.background.paper,
            '--app-secondary-main-color': palette.secondary.main,
            '--app-native-system-color': palette.nativeSystemColor,
          },
        },
      },
    },
  };
};
