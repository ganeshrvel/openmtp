import { mixins } from '../../../styles/js';

export const styles = (theme) => ({
  root: {
    textAlign: `center`,
    ...mixins({ theme }).center,
    ...mixins({ theme }).absoluteCenter,
  },
  bugImg: {
    ...mixins({ theme }).noDrag,
    height: `auto`,
    width: 150,
  },
  headings: {
    ...mixins({ theme }).noDrag,
    ...mixins({ theme }).noselect,
    marginTop: 15,
  },
  subHeading: {
    ...mixins({ theme }).noDrag,
    ...mixins({ theme }).noselect,
    marginTop: 15,
  },
  goBackBtn: {
    marginTop: 5,
  },
});
