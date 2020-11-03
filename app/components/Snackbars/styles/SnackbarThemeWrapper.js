import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';

export const styles = (theme) => ({
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  info: {
    backgroundColor: theme.palette.primary.dark,
  },
  warning: {
    backgroundColor: amber[700],
  },
  icon: {
    fontSize: 20,
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
  },
  root: {
    minWidth: 288,
    maxWidth: 568,
    borderRadius: 4,
    flexGrow: `unset`,
  },
});
