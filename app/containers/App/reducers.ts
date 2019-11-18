import { AppReducersState } from './types/reducers';
import { AppActions } from './types/actions';

export const initialState: AppReducersState = {};

export default function App(
  state: AppReducersState = initialState,
  action: AppActions
) {
  const { type } = action;

  switch (type) {
    default:
      return state;
  }
}
