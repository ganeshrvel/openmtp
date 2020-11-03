import { mixins } from '../../../styles/js';

export const styles = (theme) => ({
  root: {
    textAlign: `center`,
    ...mixins({ theme }).center,
    width: 500,
    marginTop: 7,
  },
});
