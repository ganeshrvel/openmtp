'use strict';

import { variables, mixins } from '../../../styles/js';

export const styles = theme => ({
  margin: {},
  root: {},
  fieldset: {
    width: `100%`
  },
  tabHeadingWrapper: {
    borderBottom: `1px solid rgba(0, 123, 255, 0.2)`
  },
  tabContainer: {
    paddingTop: 20,
    height: 290,
    overflowX: `auto`,
    overflowY: `auto`
  },
  subtitleMarginFix: {
    marginTop: 10
  },
  subtitle: {},
  fmSettingsStylesFix: {
    marginTop: 10
  },
  subheading: {
    marginBottom: 5
  },
  title: {
    flex: `0 0 auto`,
    margin: 0,
    padding: `24px 24px 8px`
  },
  switch: {
    height: 30,
    marginBottom: 7
  },
  block: {
    marginBottom: 20
  },
  onboardingPaper: {
    position: `relative`,
    padding: 10,
    marginTop: 4,
    backgroundColor: variables().styles.secondaryColor.main
  },
  onboardingPaperArrow: {
    fontWeight: `bold`,
    content: ' ',
    borderBottom: `11px solid ${variables().styles.secondaryColor.main}`,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    position: 'absolute',
    top: -10,
    left: 2
  },
  onboardingPaperBody: {
    color: variables().styles.primaryColor.main
  },
  a: {
    fontWeight: `bold`
  },
  btnPositive: {
    ...mixins().btnPositive
  }
});
