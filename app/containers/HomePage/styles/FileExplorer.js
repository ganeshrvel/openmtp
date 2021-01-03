export const styles = (theme) => ({
  socialMediaShareContainer: {
    paddingTop: 5,
  },
  socialMediaShareTitle: {
    fontSize: 11,
    fontWeight: 500,
  },
  socialMediaShareBtnsContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  socialMediaBtnWrapper: {
    width: 50,
    height: 50,
  },
  socialMediaBtnWrapperForImage: {
    padding: `7px !important`,
    background: '#fff',
    [`&:hover`]: {
      background: `rgba(255, 255, 255, 0.85) !important`,
    },
  },
  socialMediaShareBtn: {
    height: 22,
    width: `22px`,
    color: theme.palette.contrastPrimaryMainColor,
  },
  socialMediaShareBtnImages: {
    height: 27,
    width: 27,
  },
  imageBtn: {
    padding: `7px !important`,
    background: '#fff',
    [`&:hover`]: {
      background: `rgba(255, 255, 255, 0.85) !important`,
    },
  },
});
