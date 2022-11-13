#!/usr/bin/env zx

import 'zx/globals';
import axiosPackage from 'axios';
import process from 'process';
import { IS_PROD_WORKFLOW } from './constants.mjs';

require('dotenv').config();

process.env.FORCE_COLOR = 3;
$.shell = '/bin/zsh';

await $`export LANG=en_US.UTF-8`;
await $`export LC_ALL=en_US.UTF-8`;

const CODEMAGIC_BASE_URL = `https://api.codemagic.io`;

const axios = axiosPackage.create({
  baseURL: CODEMAGIC_BASE_URL,
});

axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['x-auth-token'] =
  process.env.CODEMAGIC_AUTH_TOKEN_ID;
axios.defaults.timeout = 15000;

let workflowId;
if (IS_PROD_WORKFLOW) {
  workflowId = process.env.CODEMAGIC_INTEL_X64_WORKFLOW_ID_PROD;
} else {
  workflowId = process.env.CODEMAGIC_INTEL_X64_WORKFLOW_ID_DEV;
}

// starting a new codemagic `macos-intel-x64-build` instance
console.info(`starting a new CodeMagic 'macos-intel-x64-build' instance...\n`);
try {
  await axios.post('/builds', {
    appId: `${process.env.CM_PROJECT_ID}`,
    workflowId,
    branch: `${process.env.CM_BRANCH}`,
    environment: {
      variables: {
        CM_ARTIFACT_LINKS_M1_ARM64: process.env.CM_ARTIFACT_LINKS,
      },
    },
  });
} catch (e) {
  throw new Error(
    `starting a new CodeMagic 'macos-intel-x64-build' instance failed: ${e}`
  );
}
