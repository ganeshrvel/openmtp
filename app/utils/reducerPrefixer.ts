import { GenericString } from '../types';

export default (prefix: string, typesList: string[]): GenericString => {
  return typesList.reduce((result, value) => {
    // eslint-disable-next-line no-param-reassign
    result[value] = `${prefix}/${value}`;

    return result;
  }, {});
};
