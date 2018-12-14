'use strict';

import React from 'react';
import { Switch, Route } from 'react-router';
import HomePage from '../containers/HomePage/Loadable';
import ReportBugs from '../containers/ReportBugs/Loadable';
import Progressbar from '../containers/Progressbar';
import NotFoundPage from '../containers/NotFoundPage/Loadable';

const routes = {
  Home: {
    path: '/',
    exact: true,
    component: HomePage
  },
  ReportBugs: {
    path: '/reportBugs',
    exact: true,
    component: ReportBugs
  },
  Progressbar: {
    path: '/progressbar',
    exact: true,
    component: Progressbar
  },
  NotFound: {
    component: NotFoundPage
  }
};

export default () => {
  return (
    <Switch>
      {Object.keys(routes).map(a => (
        <Route
          key={routes[a].path || 'notfound'}
          {...routes[a]}
          component={routes[a].component}
        />
      ))}
    </Switch>
  );
};
