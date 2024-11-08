export const styles = (theme) => ({
  socialMediaShareContainer: {
    paddingTop: 5,
  },
  supportBtnsTitle: {
    marginBottom: 10,
    fontSize: 12,
    fontWeight: 500,
  },
  supportBtnsTitleNewLine: {
    display: 'block',
  },
  supportBtnsBoldText: {
    fontWeight: 'bold',
  },
  buildProduct: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: 500,
  },
  connectPortfolioUrl: {
    cursor: `pointer`,
    color: theme.palette.secondary.main,
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

  supportBtnsContainer: {
    width: `100%`,
    display: `flex`,
  },
  supportBtnWrapper: {
    width: 'auto',
  },
  supportBtnWrapperForImage: {
    padding: `0px 10px 5px 0 !important`,
  },
  supportBtnImages: {
    width: `100%`,
    height: 40,
    cursor: 'pointer',

    [`&:hover`]: {
      filter: `brightness(0.85)`,
    },

    [`&.paypal`]: {
      background: `#fff`,
      borderRadius: 7,
      padding: 7,
    },
  },
});
