const reducerPrefixer = <T extends string>(
  prefix: string,
  typesList: T[]
): {
  [key in T]: string;
} => {
  const _return = {} as {
    [key in T]: string;
  };

  typesList.map(a => {
    _return[a] = `${prefix}/${a}`;

    return a;
  });

  return _return;
};

export default reducerPrefixer;
