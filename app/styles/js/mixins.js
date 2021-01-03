// eslint-disable-next-line no-unused-vars
import { checkIf } from '../../utils/checkIf';

export const commonThemes = {
  resetUl: {
    'margin-block-start': 'unset',
  },
  noselect: {
    [`-webkitTouchCallout`]: `none`,
    [`-webkitUserSelect`]: `none`,
    [`-khtmlUserSelect`]: `none`,
    [`-mozUserSelect`]: `none`,
    [`-msUserSelect`]: `none`,
    [`userSelect`]: `none`,
  },
  noDrag: {
    WebkitUserDrag: 'none',
    KhtmlUserDrag: 'none',
    MozUserDrag: 'none',
    OUserDrag: 'none',
    userDrag: 'none',
  },
  noOutline: {
    outline: `none !important`,
  },
  absoluteCenter: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    WebkitTransform: 'translate(-50%, -50%)',
    transform: 'translate(-50%, -50%)',
  },
  center: {
    marginLeft: `auto`,
    marginRight: `auto`,
  },
  get appDragEnable() {
    return {
      [`-webkitAppRegion`]: `drag`,
      ...this.noselect,
    };
  },
  appDragDisable: {
    [`-webkitAppRegion`]: `no-drag`,
  },
};

export default ({ theme }) => {
  checkIf(theme, 'object');

  return {
    ...commonThemes,
    a: {
      cursor: `pointer`,
      color: theme.palette.secondary.main,
    },
    btnPositive: {
      backgroundColor: theme.palette.secondary.main,
      borderColor: theme.palette.secondary.main,
      color: theme.palette.btnTextColor,
      '&:hover': {
        backgroundColor: '#0069d9',
        borderColor: '#0062cc',
      },
      '&:active': {
        boxShadow: 'none',
        backgroundColor: '#0062cc',
        borderColor: '#005cbf',
      },
      '&:focus': {
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,0.5)',
      },
    },

    btnNegative: {
      backgroundColor: `rgba(0, 122, 245, 0.08)`,
      borderColor: `rgba(0, 122, 245, 0.08)`,
      '&:hover': {
        backgroundColor: `rgba(0, 122, 245, 0.15)`,
        borderColor: '#0062cc',
      },
      '&:active': {
        boxShadow: 'none',
        backgroundColor: `rgba(0, 122, 245, 0.23)`,
        borderColor: '#005cbf',
      },
      '&:focus': {
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,0.5)',
      },
    },

    btnNegativeWhite: {
      border: '1px solid rgba(0, 0, 0, 0.21)',
      backgroundColor: '#fff',
      color: '#000',
      '&:hover': {
        backgroundColor: `rgba(255, 255, 255, 0.65)`,
        borderColor: '1px solid rgba(0, 0, 0, 0.21)',
      },
      '&:active': {
        boxShadow: 'none',
        backgroundColor: `rgba(255, 255, 255, 0.55)`,
        borderColor: '1px solid rgba(0, 0, 0, 0.21)',
      },
      '&:focus': {
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,0.5)',
      },
    },
  };
};
