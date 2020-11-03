import { variables, mixins } from '../../../styles/js';

export const styles = (theme) => ({
  socialMediaShareContainer: {
    paddingTop: 5,
  },
  socialMediaShareTitle: {
    fontSize: 11,
    fontWeight: 500,
  },
  socialMediaShareBtnsWrapper: {
    width: '100%',
    display: 'flex',
  },
  socialMediaShareBtn: {
    height: 22,
    width: `22px`,
    color: theme.palette.contrastPrimaryMainColor,
  },
});
