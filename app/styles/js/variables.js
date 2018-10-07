'use strict';

export const variables = args => {
  return {
    sizes: {
      toolbarHeight: 64,
      sidebarAreaPaneMaxWidth: 290,
      sidebarAreaPaneMinWidth: 260,
    },
    styles: {
      regularFontSize: 14,
      borderThinDividerColor:
        'solid 1px var(--black-transparent-12,rgba(0,0,0,.12))'
    }
  };
};
