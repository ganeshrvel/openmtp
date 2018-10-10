'use strict';

import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import Alerts from '../../containers/Alerts/reducers';
import Settings from '../../containers/Settings/reducers';

const rootReducer = asyncReducers =>
  combineReducers({
    Alerts,
    Settings,
    router,
    ...asyncReducers
  });

export default rootReducer;
