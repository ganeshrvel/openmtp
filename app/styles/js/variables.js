'use strict';

export const variables = args => {
  return {
    sizes: {
      toolbarHeight: 64,
      sidebarAreaPaneWidth: 300,
      sidebarAreaPaddingTop: 40
    },
    styles: {
      primaryColor: {
        main: '#ffffff'
      },
      secondaryColor: {
        main: '#007af5'
      },
      regularFontSize: 14,
      borderThinDividerColor:
        'solid 1px var(--black-transparent-12,rgba(0,0,0,.12))'
    },
    mixins: {
      noselect: {
        [`-webkitTouchCallout`]: `none`,
        [`-webkitUserSelect`]: `none`,
        [`-khtmlUserSelect`]: `none`,
        [`-mozUserSelect`]: `none`,
        [`-msUserSelect`]: `none`,
        [`userSelect`]: `none`
      },
      noDrag: {
        WebkitUserDrag: 'none',
        KhtmlUserDrag: 'none',
        MozUserDrag: 'none',
        OUserDrag: 'none',
        userDrag: 'none'
      },
      absoluteCenter: {
        position: 'absolute',
        left: '50%',
        top: '50%',
        WebkitTransform: 'translate(-50%, -50%)',
        transform: 'translate(-50%, -50%)'
      },
      center: {
        marginLeft: `auto`,
        marginRight: `auto`
      }
    }
  };
};
