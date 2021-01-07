import React, { lazy, Suspense } from 'react';
import LoadingIndicator from '../../components/LoadingIndicator';

const Component = lazy(() => import('.'));

export default function loadable({ ...props }) {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <Component {...props} />
    </Suspense>
  );
}
