import { mixins } from '../../../styles/js';

export const styles = (theme) => ({
  root: {},
  btnPositive: {
    ...mixins({ theme }).btnPositive,
  },
  divider: {
    marginBottom: 20,
  },
  contentBox: {
    padding: 25,
    background: 'rgba(224, 224, 224, 0.12)',
  },
});
