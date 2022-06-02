#!/usr/bin/env zx

import "zx/globals";
import { packageDirectory } from "pkg-dir";
import axiosPackage from "axios";
import process from "process";
import { spawn } from "child_process";

require("dotenv").config();

process.env.FORCE_COLOR = 3;
$.shell = "/bin/zsh";

await $`export LANG=en_US.UTF-8`;
await $`export LC_ALL=en_US.UTF-8`;

const PKG_ROOT_DIR = await packageDirectory();
const CODEMAGIC_BASE_URL = `https://api.codemagic.io`;

const axios = axiosPackage.create({
  baseURL: CODEMAGIC_BASE_URL
});

axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["x-auth-token"] = process.env.CODEMAGIC_AUTH_TOKEN_ID;
axios.defaults.timeout = 15000;

console.log("=== process.env.CM_ARTIFACT_LINKS", process.env.CM_ARTIFACT_LINKS)

// const cliArgs = basicArgs({
//   name: 'codemagic-start-mac-intel-x64-vm',
//   description: 'start codemagic mac intel x64 vm',
//   errorOnUnknown: true,
//   options: {
//     'artifact-data': {
//       type: String,
//       description: 'base64 encoded artifact json data'
//     },
//   }
// })
//
// console.log(cliArgs)


const buildResponse = await axios.post("/builds", {
  "appId": `${process.env.CODEMAGIC_APP_ID}`,
  "workflowId": `${process.env.CODEMAGIC_WORKFLOW_ID}`,
  "branch": `${process.env.CODEMAGIC_GIT_BRANCH}`
});

console.log("==== buildResponse", buildResponse);




async function runSpawn(command, args) {
  return new Promise((resolve, reject) => {
    const buildSpawn = spawn(
      command,
      args,
      { stdio: [0, 1, 2] }
    );

    buildSpawn.on("exit", (exitCode) => {
      if (exitCode !== 0) {
        return reject(exitCode);
      }

      return resolve();
    });
  });
}
