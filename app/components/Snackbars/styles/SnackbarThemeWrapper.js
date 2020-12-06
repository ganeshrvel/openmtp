import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';

export const styles = (theme) => ({
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.snackbar.error,
  },
  info: {
    backgroundColor: theme.palette.primary.dark,
  },
  warning: {
    backgroundColor: amber[700],
  },
  icon: {
    fontSize: 25,
    color: '#fff',
  },
  closeBtn: {
    color: '#fff',
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: 10,
  },
  message: {
    display: 'flex',
    alignItems: 'center',
    color: '#fff',
    fontWeight: 500,
  },
  root: {
    minWidth: 288,
    maxWidth: 568,
    minHeight: 60,
    borderRadius: 15,
    flexGrow: `unset`,
    cursor: `pointer`,
  },
});
