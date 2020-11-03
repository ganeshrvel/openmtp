import { variables, mixins } from '../../../styles/js';

export const styles = (theme) => ({
  root: {
    padding: '5px 15px 0 15px',
    width: '100%',
    background: theme.palette.tableHeaderFooterBgColor,
    height: 30,
    textAlign: 'center',
  },

  bodyWrapper: {
    fontWeight: '500',
    color: theme.palette.lightText1Color,
  },
});
