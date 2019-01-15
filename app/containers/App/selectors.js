'use strict';

/* eslint-disable no-unused-vars */

import { createSelector } from 'reselect';
import { initialState } from './reducers';

const make = (state, props) => (state ? state.App : {});

/* eslint-enable no-unused-vars */
