'use strict';

import * as React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { variables, mixins } from '../../../styles/js';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: `100%`,
      height: 14
      //...mixins().appDragEnable
    }
  })
);
