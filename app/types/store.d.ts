// Your root reducer type, which is your redux state types also
import { RouterState } from 'connected-react-router';
import { AppReducersState } from '../containers/App/types/reducers';
import Alerts from '../containers/Alerts/reducers';
import Settings from '../containers/Settings/reducers';

export interface RootState {
  readonly router: RouterState;
  readonly App: AppReducersState;
  //readonly Alerts: RouterState;
  //readonly Settings: RouterState;
}
