import { variables, mixins } from '../../../styles/js';

export const styles = (theme) => {
  return {
    root: {
      width: `100%`,
      height: 14,
      ...mixins({ theme }).appDragEnable,
    },
  };
};
