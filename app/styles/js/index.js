'use strict';

import { variables } from './variables';
export const base = args => {
  return {
    variables: variables(args)
  };
};
