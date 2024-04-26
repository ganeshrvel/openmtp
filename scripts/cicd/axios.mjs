import process from 'process';
import axiosPackage from 'axios';

import { CODEMAGIC_BASE_URL } from './constants.mjs';

export const axios = axiosPackage.create({
  baseURL: CODEMAGIC_BASE_URL,
});

axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['x-auth-token'] =
  process.env.CODEMAGIC_AUTH_TOKEN_ID;
axios.defaults.timeout = 15000;
