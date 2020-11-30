import { mixins } from '../../../styles/js';

export const styles = (theme) => {
  return {
    root: {
      width: `100%`,
      height: 14,
      textAlign: 'center',
      ...mixins({ theme }).appDragEnable,
      ...mixins({ theme }).center,
    },
    deviceInfo: {
      ...mixins({ theme }).center,
      width: `100%`,
      textAlign: 'center',
      color: theme.palette.lightText1Color,
      fontWeight: 'bold',
      fontSize: '12px',
    },
    deviceModel: {
      textTransform: 'capitalize',
    },
  };
};
