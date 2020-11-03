import { variables } from '../../../styles/js';

export const styles = (_) => {
  return {
    listsWrapper: {
      paddingTop: variables().sizes.sidebarAreaPaddingTop,
      width: variables().sizes.sidebarAreaPaneWidth,
    },
    listsBottom: {
      paddingTop: 5,
    },
    listIcon: {
      minWidth: 35,
    },
    listsCaption: {
      padding: `14px 0 0px 20px`,
    },
    primary: {},
    icon: {},
  };
};
