import { mixins } from '../../../styles/js';

export const styles = (theme) => {
  return {
    root: {
      width: `100%`,
      height: `100%`,
    },

    rootBreadcrumbs: {
      width: `100%`,
      height: `100%`,
    },

    breadcrumb: {
      padding: '10px 15px',
      backgroundColor: theme.palette.background.paper,
      display: 'flex',
      alignItems: 'center',
      ...mixins({ theme }).resetUl,
    },

    breadcrumbLi: {
      display: 'inline-block',
      padding: '0 2px 4px 2px',
      overflow: 'hidden',
      fontSize: 14,
      maxWidth: 59,
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },

    breadcrumbLiA: {
      cursor: `pointer`,
      color: theme.palette.secondary.main,
      textDecoration: 'none',
      [`&.bold`]: {
        fontWeight: `bold`,
      },
    },
    breadcrumbSeperator: {
      fontSize: 18,
    },
  };
};
