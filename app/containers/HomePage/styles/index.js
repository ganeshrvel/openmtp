export const styles = (_) => {
  return {
    root: {},
    grid: {
      width: `100%`,
    },
    splitPane: {
      width: `50%`,
      float: `left`,
      [`&:after`]: {
        content: '""',
        display: `table`,
        clear: `both`,
      },
    },
  };
};
