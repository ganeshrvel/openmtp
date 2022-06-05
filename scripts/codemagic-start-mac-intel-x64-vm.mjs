#!/usr/bin/env zx

import "zx/globals";
import { packageDirectory } from "pkg-dir";
import axiosPackage from "axios";
import process from "process";

require("dotenv").config();

process.env.FORCE_COLOR = 3;
$.shell = "/bin/zsh";

await $`export LANG=en_US.UTF-8`;
await $`export LC_ALL=en_US.UTF-8`;

const CODEMAGIC_BASE_URL = `https://api.codemagic.io`;

const axios = axiosPackage.create({
  baseURL: CODEMAGIC_BASE_URL
});

axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["x-auth-token"] = process.env.CODEMAGIC_AUTH_TOKEN_ID;
axios.defaults.timeout = 15000;

try {
  await axios.post("/bui", {
    "appId": `${process.env.CODEMAGIC_APP_ID}`,
    "workflowId": `${process.env.CODEMAGIC_INTEL_X64_WORKFLOW_ID}`,
    "branch": `${process.env.CODEMAGIC_GIT_BRANCH}`,
    "environment": {
      "variables": {
        "CM_ARTIFACT_LINKS_M1_ARM64": process.env.CM_ARTIFACT_LINKS
      }
    }
  });
} catch (e) {
  throw Error(e);
}
