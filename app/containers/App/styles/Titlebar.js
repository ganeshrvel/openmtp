import { variables, mixins } from '../../../styles/js';

export const styles = {
  root: {
    width: `100%`,
    height: 14,
    ...mixins().appDragEnable
  }
};
