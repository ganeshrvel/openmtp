/* eslint global-require: off */

import './services/sentry';

import React from 'react';
import { render } from 'react-dom';
import Root from './containers/App/Root';
import { history, store } from './store/configureStore';
import './styles/scss/app.global.scss';

const MOUNT_POINT = document.getElementById('root');

render(<Root store={store} history={history} />, MOUNT_POINT);
