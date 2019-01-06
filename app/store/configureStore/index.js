'use strict';

import configureStoreDev from './dev';
import configureStoreProd from './prod';
import { IS_PROD } from '../../constants/env';

const selectedConfigureStore = IS_PROD ? configureStoreProd : configureStoreDev;

export const { configureStore } = selectedConfigureStore;

export const { history } = selectedConfigureStore;
