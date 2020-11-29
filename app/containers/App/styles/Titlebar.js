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
      color: 'rgba(255, 255, 255, 0.50)',
      fontWeight: 'bold',
      fontSize: '12px',
    },
    deviceModel: {
      textTransform: 'capitalize',
    },
  };
};
