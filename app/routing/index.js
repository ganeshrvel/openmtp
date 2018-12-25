'use strict';

import React from 'react';
import { Switch, Route } from 'react-router';
import HomePage from '../containers/HomePage/Loadable';
import ReportBugsPage from '../containers/ReportBugsPage/Loadable';
import ProgressbarPage from '../containers/ProgressbarPage';
import PrivacyPolicyPage from '../containers/PrivacyPolicyPage/Loadable';
import NotFoundPage from '../containers/NotFoundPage/Loadable';

export const routes = {
  Home: {
    path: '/',
    exact: true,
    component: HomePage
  },
  ReportBugsPage: {
    path: '/reportBugsPage',
    exact: true,
    component: ReportBugsPage
  },
  ProgressbarPage: {
    path: '/progressbarPage',
    exact: true,
    component: ProgressbarPage
  },
  PrivacyPolicyPage: {
    path: '/privacyPolicyPage',
    exact: true,
    component: PrivacyPolicyPage
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
