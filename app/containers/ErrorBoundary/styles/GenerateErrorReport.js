import { variables, mixins } from '../../../styles/js';

export const styles = (theme) => ({
  subHeading: {
    ...mixins().noDrag,
    ...mixins().noselect,
    marginTop: 15,
  },
  instructions: {
    listStyle: `none`,
    color: variables().styles.lightText1Color,
    lineHeight: '24px',
    marginTop: 15,
    paddingLeft: 0,
    marginBottom: 15,
  },
  generateLogsBtnWrapper: {},
  generateLogsBtn: {
    marginTop: 0,
    ...mixins().btnPositive,
  },
  emailIdWrapper: {
    color: variables().styles.lightText1Color,
    marginTop: 15,
  },
  emailId: {
    marginLeft: 16,
    fontWeight: `bold`,
  },
});
