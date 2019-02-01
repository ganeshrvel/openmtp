'use strict';

import Loadable from 'react-imported-component';
import LoadingIndicator from '../../components/LoadingIndicator';

export default Loadable(() => import('./index'), {
  LoadingComponent: LoadingIndicator
});
