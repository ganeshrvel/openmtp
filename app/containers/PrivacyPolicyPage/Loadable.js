'use strict';

import React, { lazy, Suspense } from 'react';
import LoadingIndicator from '../../components/LoadingIndicator';

const Component = lazy(() => import('.'));

export default function loadable() {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <Component />
    </Suspense>
  );
}
