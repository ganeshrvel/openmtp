'use strict';

import React from 'react';
import { Switch, Route } from 'react-router';
import HomePage from '../containers/HomePage/Loadable';
import CounterPage from '../containers/CounterPage/Loadable';
import NotFoundPage from '../containers/NotFoundPage/Loadable';

const _routes = {
  Home: {
    path: '/',
    exact: true,
    component: HomePage
  },
  Counter: {
    path: '/counter',
    exact: true,
    component: CounterPage
  },
  NotFound: {
    component: NotFoundPage
  }
};

export const routes = JSON.parse(
  JSON.stringify(_routes, (k, v) => (k === 'component' ? undefined : v))
);

export default () => {
  return (
    <Switch>
      {Object.keys(routes).map(a => (
        <Route
          key={routes[a].path || 'notfound'}
          {...routes[a]}
          component={_routes[a].component}
        />
      ))}
    </Switch>
  );
};
