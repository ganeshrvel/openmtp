import { variables, mixins } from '../../../styles/js';

export const styles = (theme) => ({
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
    backgroundColor: variables().styles.background.paper,
    display: 'flex',
    alignItems: 'center',
    ...mixins().resetUl,
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
    color: variables().styles.secondaryColor.main,
    textDecoration: 'none',
    [`&.bold`]: {
      fontWeight: `bold`,
    },
  },
  breadcrumbSeperator: {
    fontSize: 18,
  },
});
