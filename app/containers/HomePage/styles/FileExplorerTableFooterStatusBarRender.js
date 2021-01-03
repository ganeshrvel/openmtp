export const styles = (theme) => ({
  root: {
    padding: '5px 15px 0 15px',
    width: '100%',
    background: theme.palette.tableHeaderFooterBgColor,
    height: 30,
    textAlign: 'center',
  },

  deviceTypeWrapper: {
    fontWeight: '500',
    color: theme.palette.secondary.main,
    marginLeft: 5,
    fontSize: 12,
    textTransform: 'capitalize',

    [`& span`]: {
      color: theme.palette.contrastPrimaryMainColor,
      fontWeight: '600',
      fontSize: 13,
    },
  },

  bodyWrapper: {
    fontWeight: '500',
    color: theme.palette.lightText1Color,
  },
});
