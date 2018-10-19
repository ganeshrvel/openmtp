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
    padding: '5px 15px',
    backgroundColor: '#fff'
  },

  breadcrumbLi: {
    // verticalAlign: 'middle',
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
    textDecoration: 'none'
  },
  breadcrumbSeperator: {
    width: 19
  }
});
