

import { variables, mixins } from '../../../styles/js';

export const styles = (theme) => ({
  wrapper: {},
  itemWrapper: {
    float: `left`,
    width: 100,
    height: 137,
  },
  itemCheckBox: {
    display: `none`,
  },
  itemIcon: {
    width: 'auto',
    height: `auto`,
  },
  itemSelected: {
    backgroundColor: 'rgba(41, 121, 255, 0.15) !important',
  },
  itemFileName: {
    wordBreak: `break-all`,
    textAlign: `center`,
  },
  itemFileNameWrapper: {
    marginLeft: 12,
    marginRight: 12,
    marginTop: -8,
    textAlign: `center`,
  },
});
