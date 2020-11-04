import { mixins } from '../../../styles/js';

export const styles = (theme) => ({
  margin: {},
  root: {},
  fieldset: {
    width: `100%`,
  },
  tabHeadingWrapper: {
    borderBottom: `1px solid rgba(0, 123, 255, 0.2)`,
  },
  tab: {
    minWidth: 100,
  },
  tabContainer: {
    paddingTop: 20,
    paddingLeft: 15,
    height: 350,
    overflowX: `auto`,
    overflowY: `auto`,
    borderBottom: `rgba(0, 122, 245, 0.15) 1px solid`,
  },
  subtitleMarginFix: {
    marginTop: 10,
  },
  subtitle: {},
  fmSettingsStylesFix: {
    marginTop: 10,
  },
  subheading: {
    marginBottom: 5,
  },
  title: {
    flex: `0 0 auto`,
    margin: 0,
    padding: `24px 24px 8px`,
  },
  switch: {
    height: 30,
    marginBottom: 7,
  },
  block: {
    marginBottom: 20,
  },
  onboardingPaper: {
    position: `relative`,
    padding: 10,
    marginTop: 4,
    backgroundColor: theme.palette.secondary.main,
  },
  onboardingPaperArrow: {
    fontWeight: `bold`,
    content: ' ',
    borderBottom: `11px solid ${theme.palette.secondary.main}`,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    position: 'absolute',
    top: -10,
    left: 2,
  },
  onboardingPaperBody: {
    color: theme.palette.background.paper,
  },
  a: {
    fontWeight: `bold`,
  },
  btnPositive: {
    ...mixins({ theme }).btnPositive,
  },
});
