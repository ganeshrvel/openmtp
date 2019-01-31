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
    height: 235,
    overflowX: `auto`,
    overflowY: `auto`
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
  onBoardingPaper: {
    position: `relative`,
    padding: 10,
    marginTop: 4,
    backgroundColor: variables().styles.secondaryColor.main
  },
  onBoardingPaperArrow: {
    fontWeight: `bold`,
    content: ' ',
    borderBottom: `11px solid ${variables().styles.secondaryColor.main}`,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    position: 'absolute',
    top: -10,
    left: 2
  },
  onBoardingPaperBody: {
    color: variables().styles.primaryColor.main
  },
  a: {
    fontWeight: `bold`
  },
  btnPositive: {
    ...mixins().btnPositive
  }
});
