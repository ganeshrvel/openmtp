export const styles = (theme) => ({
  socialMediaShareContainer: {
    paddingTop: 5,
  },
  donationBtnsTitle: {
    marginBottom: 10,
    fontSize: 12,
    fontWeight: 500,
  },
  donationBtnsTitleNewLine: {
    display: 'block',
  },
  donationBtnsBoldText: {
    fontWeight: 'bold',
  },
  socialMediaShareTitle: {
    marginTop: 10,
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
    height: 23,
    width: 23,
  },
  imageBtn: {
    padding: `7px !important`,
    background: '#fff',
    [`&:hover`]: {
      background: `rgba(255, 255, 255, 0.85) !important`,
    },
  },
});
