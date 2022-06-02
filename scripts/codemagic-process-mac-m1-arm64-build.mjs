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

console.log("=== process.env.CM_ARTIFACT_LINKS_M1_ARM64", process.env.CM_ARTIFACT_LINKS_M1_ARM64);
console.log("=== typeof process.env.CM_ARTIFACT_LINKS_M1_ARM64", typeof process.env.CM_ARTIFACT_LINKS_M1_ARM64);

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


// const buildResponse = await axios.post("/builds", {
//   "appId": `${process.env.CODEMAGIC_APP_ID}`,
//   "workflowId": `${process.env.CODEMAGIC_INTEL_X64_WORKFLOW_ID}`,
//   "branch": `${process.env.CODEMAGIC_GIT_BRANCH}`,
//   "environment": {
//     "variables": {
//       "CM_ARTIFACT_LINKS_M1_ARM64": process.env.CM_ARTIFACT_LINKS
//     }
//   }
// });
//
//
// console.log("==== buildResponse", buildResponse);


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
