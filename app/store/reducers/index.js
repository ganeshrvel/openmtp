'use strict';

import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import Alerts from '../../containers/Alerts/reducers';

const rootReducer = asyncReducers =>
  combineReducers({
    Alerts,
    router,
    ...asyncReducers
  });

export default rootReducer;
