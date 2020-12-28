import mixins from '../../../styles/js/mixins';

export const styles = (theme) => ({
  root: {
    minHeight: 400,
    overflowY: 'auto',
    maxHeight: 400,
  },
  expansionRoot: {
    background: theme.palette.tableHeaderFooterBgColor,
  },
  heading: {
    fontWeight: 600,
  },
  imagePlaceholder: {
    width: 200,
    height: 'auto',
  },
  imgWrapper: {
    ...mixins({ theme }).center,
    textAlign: 'center',
  },
});
