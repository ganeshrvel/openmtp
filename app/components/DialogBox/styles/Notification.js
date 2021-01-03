import { mixins } from '../../../styles/js';

export const styles = (theme) => ({
  margin: {},
  root: {},
  btnPositive: {
    ...mixins({ theme }).btnPositive,
  },
  btnNegative: {
    ...mixins({ theme }).btnNegative,
  },
});
