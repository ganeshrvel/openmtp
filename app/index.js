/* eslint global-require: off */

import React from 'react';
import { render } from 'react-dom';
import Root from './containers/App/Root';
import { history, store } from './store/configureStore';
import './styles/scss/app.global.scss';
import './services/sentry/index';

const MOUNT_POINT = document.getElementById('root');

render(<Root store={store} history={history} />, MOUNT_POINT);
