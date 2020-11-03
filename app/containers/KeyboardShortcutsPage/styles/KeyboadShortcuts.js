import { variables, mixins } from '../../../styles/js';

export const styles = (theme) => ({
  root: {},
  title: {
    fontWeight: `bold`,
  },
  kbdWrapper: {
    paddingBottom: 14,
  },
  kbdInnerWrapper: {
    display: `inline-block`,
  },
  kbdTitle: {
    display: 'block',
    color: theme.palette.lightText1Color,
    padding: '1px 0 6px 0',
    fontSize: 14,
  },
});
