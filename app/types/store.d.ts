// Your root reducer type, which is your redux state types also
import { RouterState } from 'connected-react-router';
import { AppReducersState } from '../containers/App/types/reducers';
import { SettingsReducersState } from '../containers/Settings/types/reducers';

export interface RootState {
  readonly router: RouterState;
  readonly App: AppReducersState;
  readonly Settings: SettingsReducersState;
  //readonly Alerts: RouterState;
}

export type GetState = () => RootState;
