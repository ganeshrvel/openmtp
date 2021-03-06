import { mixins } from '../../../../styles/js';

export const styles = (theme) => ({
  root: {
    padding: `0 25px 10px 25px`,
  },

  loadingText: { padding: 15 },

  title: {
    fontWeight: `bold`,
  },

  releaseNotes: {
    fontWeight: `bold`,
    marginTop: 10,
  },

  scrollContainer: {
    ...mixins({ theme }).center,
    marginTop: 5,
    border: `1px solid #000`,
    background: theme.palette.background.paper,
    height: 350,
    width: '100%',
    padding: 15,
    overflowX: 'auto',
    overflowY: 'auto',
  },

  btnWrapper: {
    position: `absolute`,
    bottom: 15,
    right: 24,
  },

  btnPositive: {
    ...mixins({ theme }).btnPositive,
    margin: `0 0 0 10px`,
  },

  btnNegative: {
    ...mixins({ theme }).btnNegativeWhite,
  },
});
