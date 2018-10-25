'use strict';

import { base } from '../../../styles/js';
const { variables } = base();

export const styles = theme => ({
  root: {
    width: `100%`,
    height: `100%`
  },
  rootBreadcrumbs: {
    width: `100%`,
    height: `100%`
  },

  breadcrumb: {
    padding: '1px 15px',
    backgroundColor: variables.styles.primaryColor.main,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  breadcrumbLi: {
    display: 'inline-block',
    padding: '0 2px 4px 2px',
    overflow: 'hidden',
    fontSize: 14,
    maxWidth: 59,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },

  breadcrumbLiA: {
    cursor: `pointer`,
    color: variables.styles.secondaryColor.main,
    textDecoration: 'none',
    [`&.bold`]: {
      fontWeight: `bold`
    }
  },
  breadcrumbSeperator: {
    fontSize: 17
  }
});
