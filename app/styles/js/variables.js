'use strict';

export const variables = args => {
  return {
    sizes: {
      toolbarHeight: 64,
      sidebarAreaPaneWidth: 300,
      sidebarAreaPaddingTop: 40
    },
    styles: {
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
      }
    }
  };
};
