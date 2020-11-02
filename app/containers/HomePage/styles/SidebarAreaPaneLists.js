

import { variables, mixins } from '../../../styles/js';

export const styles = (theme) => {
  return {
    listsWrapper: {
      paddingTop: variables().sizes.sidebarAreaPaddingTop,
      width: variables().sizes.sidebarAreaPaneWidth,
    },
    listsBottom: {
      paddingTop: 5,
    },
    listsCaption: {
      padding: `14px 0 0px 20px`,
    },
    primary: {},
    icon: {},
  };
};
