'use strict';

import styled from 'styled-components';
import TextField from '@material-ui/core/TextField';
import { variables, mixins } from '../../../styles/js';

export const styles = theme => ({
  root: {},
  dialogContentText: {
    marginBottom: 10,
    wordBreak: `break-all`
  },
  btnPositive: {
    ...mixins().btnPositive
  },
  btnNegative: {
    ...mixins().btnNegative
  },
  textFieldRoot: {
    '& .MuiFormLabel-root.Mui-error.Mui-focused': {
      color: '#f44336'
    },
    '& .MuiFormLabel-root.Mui-focused': {
      color: 'unset'
    }
  }
});

export const StyledTextField = styled(TextField)`
  /* hover (double-ampersand needed for specificity reasons. */
  && .MuiInput-underline:hover:before {
    border-bottom: 1px solid rgba(0, 0, 0);
  }
  /* focused */
  .MuiInput-underline:after {
    border-bottom: 1px solid rgba(0, 0, 0, 0.87);
  }
  /* focused */
  .MuiInputLabel-root.MuiInput-focused {
    color: #000;
  }
`;
