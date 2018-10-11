'use strict';

import { base } from '../../../styles/js';
const { variables } = base();

export const styles = theme => ({
  root: {
    width: 100,
    height: 115,
    border: `1px solid`,
    position: `absolute`,
    background: `#fff`,
    zIndex: 100,
    top: 10,
    left: 10
  }
});
