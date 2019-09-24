'use strict';

import * as React from 'react';
//import { useStyles } from '../styles/Titlebar';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { toggleWindowSizeOnDoubleClick } from '../../../utils/titlebarDoubleClick';
import { APP_TITLEBAR_DOM_ID } from '../../../constants/dom';
import { TitlebarPropsTypes } from './Titlebar.types';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: `100%`,
      height: 14
      //...mixins().appDragEnable
    }
  })
);

class Titlebar extends React.PureComponent<TitlebarPropsTypes> {
  public render(): React.ReactElement {
    const styles = useStyles();

    return (
      <div
        onDoubleClick={() => {
          toggleWindowSizeOnDoubleClick();
        }}
        //className={styles.root}
        id={APP_TITLEBAR_DOM_ID}
      />
    );
  }
}

export default Titlebar;
