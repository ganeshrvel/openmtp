#!/usr/bin/env zx

import 'zx/globals';
import process from 'process';
import './base.mjs';
import { IS_PROD_WORKFLOW } from './constants.mjs';
import { axios } from './axios.mjs';

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
    appId: `${process.env.CODEMAGIC_PUBLISH_PROJECT_ID}`,
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
