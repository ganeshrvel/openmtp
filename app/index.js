'use strict';

/* eslint global-require: off */

import React from 'react';
import { render } from 'react-dom';
import Root from './containers/App/Root';
import { configureStore, history } from './store/configureStore';
import './styles/scss/app.global.scss';

const MOUNT_POINT = document.getElementById('root');
const store = configureStore();

render(<Root store={store} history={history} />, MOUNT_POINT);
