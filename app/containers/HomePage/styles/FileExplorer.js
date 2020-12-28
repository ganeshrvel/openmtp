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
  socialMediaShareBtnImages: {
    height: 21,
    width: 21,
  },
  imageBtn: {
    padding: `7px !important`,
    background: '#fff',
    [`&:hover`]: {
      background: `rgba(255, 255, 255, 0.85) !important`,
    },
  },
});
