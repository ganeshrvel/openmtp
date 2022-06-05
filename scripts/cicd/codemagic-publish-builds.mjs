#!/usr/bin/env zx

import "zx/globals";
import { packageDirectory } from "pkg-dir";
import process from "process";
import { spawn } from "child_process";
import fsExtra, { ensureDirSync } from "fs-extra";
import { readFileSync, readdirSync } from "fs";
import niceUtils from "nice-utils";
import yaml from "js-yaml";
import path from "path";
import junk from "junk";

require("dotenv").config();
const { removeSync, outputFileSync, readJsonSync } = fsExtra;
const { undefinedOrNull } = niceUtils;

process.env.FORCE_COLOR = 3;
$.shell = "/bin/zsh";

await $`export LANG=en_US.UTF-8`;
await $`export LC_ALL=en_US.UTF-8`;

const PACKAGE_JSON_FILENAME = "package.json";
const DIR_MODE = 0o2775;
const PKG_ROOT_DIR = await packageDirectory();
const TEMP_ROOT_DIR = `${PKG_ROOT_DIR}/tmp/cicd`;
const DIST_DIR = `${PKG_ROOT_DIR}/dist`;
const PACKAGE_JSON_PATH = `${PKG_ROOT_DIR}/${PACKAGE_JSON_FILENAME}`;

// M1 arm64 artifacts
const MAC_M1_ARM64_ARTIFACTS_ZIP_FILENAME = `mac_m1_arm64_artifacts.zip`;
const TEMP_MAC_M1_ARM64_ARTIFACTS_ZIP_PATH = path.resolve(TEMP_ROOT_DIR, MAC_M1_ARM64_ARTIFACTS_ZIP_FILENAME);

const MAC_M1_ARM64_ARTIFACTS_ZIP_DIR = `mac_m1_arm64_artifacts`;
const TEMP_MAC_M1_ARM64_ARTIFACTS_DIR = path.resolve(TEMP_ROOT_DIR, MAC_M1_ARM64_ARTIFACTS_ZIP_DIR);

const LATEST_MAC_M1_ARM64_YAML_PATH = `latest-mac.yml`;
const TEMP_LATEST_MAC_M1_ARM64_YAML_PATH = path.resolve(TEMP_MAC_M1_ARM64_ARTIFACTS_DIR, LATEST_MAC_M1_ARM64_YAML_PATH);
/////

// intel x64 artifacts
const MAC_INTEL_X64_ARTIFACTS_ZIP_FILENAME = `mac_intel_x64_artifacts.zip`;
const DIST_MAC_INTEL_X64_ARTIFACTS_ZIP_PATH = path.resolve(DIST_DIR, MAC_INTEL_X64_ARTIFACTS_ZIP_FILENAME);

const MAC_INTEL_X64_ARTIFACTS_ZIP_DIR = `mac_intel_x64_artifacts`;
const TEMP_MAC_INTEL_X64_ARTIFACTS_DIR = path.resolve(TEMP_ROOT_DIR, MAC_INTEL_X64_ARTIFACTS_ZIP_DIR);

const LATEST_MAC_MAC_INTEL_X64_YAML_PATH = `latest-mac.yml`;
const TEMP_LATEST_MAC_INTEL_X64_YAML_PATH = path.resolve(TEMP_MAC_INTEL_X64_ARTIFACTS_DIR, LATEST_MAC_MAC_INTEL_X64_YAML_PATH);
///

// merged artifacts
const MERGED_ARTIFACTS_DIR = `merged_artifacts`;
const TEMP_MERGED_ARTIFACTS_PATH = path.resolve(TEMP_ROOT_DIR, MERGED_ARTIFACTS_DIR);

const MERGED_MAC_ARTIFACTS_YAML_PATH = `latest-mac.yml`;
const TEMP_MERGED_MAC_ARTIFACTS_YAML_PATH = path.resolve(TEMP_MERGED_ARTIFACTS_PATH, MERGED_MAC_ARTIFACTS_YAML_PATH);
///

const cmArtifactLinksM1Arm64 = process.env.CM_ARTIFACT_LINKS_M1_ARM64;

if (undefinedOrNull(cmArtifactLinksM1Arm64)) {
  throw new Error(`the env variable 'CM_ARTIFACT_LINKS_M1_ARM64' shouldn't be empty: ${e}`);
}

let cmArtifactLinksM1Arm64Json;
try {
  cmArtifactLinksM1Arm64Json = JSON.parse(cmArtifactLinksM1Arm64);
} catch (e) {
  throw new Error(`the env variable 'CM_ARTIFACT_LINKS_M1_ARM64' isn't a valid JSON: ${e}`);
}

let packageVersion;
let packageName;
let gitReleaseTag;
try {
  const packageObject = readJsonSync(PACKAGE_JSON_PATH);
  packageName = packageObject.productName;
  packageVersion = packageObject.version;
  gitReleaseTag = `v${packageObject.version}`;
} catch (e) {
  throw new Error(`Ann error occured while reading the '${PACKAGE_JSON_PATH}' file: ${e}`);
}

console.info(`cleaning the temp directory: '${TEMP_ROOT_DIR}'...\n`);
await removeSync(TEMP_ROOT_DIR, DIR_MODE);

console.info(`creating the temp directory: ${TEMP_ROOT_DIR}...\n`);
await ensureDirSync(TEMP_ROOT_DIR, DIR_MODE);

console.info(`creating the temp directory for the merged artifacts: ${TEMP_MERGED_ARTIFACTS_PATH}...\n`);
await ensureDirSync(TEMP_MERGED_ARTIFACTS_PATH, DIR_MODE);

// find the artifact `mac_m1_arm64_artifacts.zip` from the `CM_ARTIFACT_LINKS_M1_ARM64` env JSON
let macM1Arm64ArtifactsZipUrl;
for (let artifact of cmArtifactLinksM1Arm64Json) {
  if (artifact.name === MAC_M1_ARM64_ARTIFACTS_ZIP_FILENAME) {
    macM1Arm64ArtifactsZipUrl = artifact.url;

    break;
  }
}

if (undefinedOrNull(macM1Arm64ArtifactsZipUrl)) {
  throw new Error(`invalid artifact url in the 'CM_ARTIFACT_LINKS_M1_ARM64' env variable: ${e}`);
}

// downloading the M1 arm64 artifact zip file from the macos-m1-arm64-build VM
console.info(`downloading the M1 arm64 artifact zip file from the macos-m1-arm64-build VM...\n`);
await $`curl -L -o ${TEMP_MAC_M1_ARM64_ARTIFACTS_ZIP_PATH} ${macM1Arm64ArtifactsZipUrl}`;

// extracting the M1 arm64 artifact zip
console.info(`extracting the M1 arm64 artifact zip...\n`);
await $`unzip -o ${TEMP_MAC_M1_ARM64_ARTIFACTS_ZIP_PATH} -d ${TEMP_MAC_M1_ARM64_ARTIFACTS_DIR}`;

// read the M1 arm64 artifact yaml file
console.info(`reading the M1 arm64 artifact yaml file...\n`);
let latestMacM1Arm64YamlObject;
try {
  latestMacM1Arm64YamlObject = yaml.load(readFileSync(TEMP_LATEST_MAC_M1_ARM64_YAML_PATH, "utf8"));
} catch (e) {
  throw new Error(`invalid 'latest-mac.yaml' artifact file found for M1 arm64: ${e}`);
}

// extracting the intel x64 artifact zip
console.info(`extracting the intel x64 artifact zip...\n`);
await $`unzip -o ${DIST_MAC_INTEL_X64_ARTIFACTS_ZIP_PATH} -d ${TEMP_MAC_INTEL_X64_ARTIFACTS_DIR}`;

// read the intel x64 artifact yaml file
console.info(`reading the intel x64 artifact yaml file...\n`);
let latestMacIntelX64YamlObject;
try {
  latestMacIntelX64YamlObject = yaml.load(readFileSync(TEMP_LATEST_MAC_INTEL_X64_YAML_PATH, "utf8"));
} catch (e) {
  throw new Error(`invalid 'latest-mac.yaml' artifact file found for intel x64: ${e}`);
}

// copying the artifacts into merged artifacts directory
console.info(`copying the artifacts into merged artifacts directory...\n`);
const artifactsPaths = [TEMP_MAC_M1_ARM64_ARTIFACTS_DIR, TEMP_MAC_INTEL_X64_ARTIFACTS_DIR];

for await (let artifactsDir of artifactsPaths) {
  await $`cp -r ${artifactsDir}/**/* ${TEMP_MERGED_ARTIFACTS_PATH}`;
}

// merging the M1 arm64 yaml into intel x64 file
console.info(`merging the M1 arm64 yaml into intel x64 file...\n`);
latestMacIntelX64YamlObject.files.push(...latestMacM1Arm64YamlObject.files);
const yamlIntelX64Dump = yaml.dump(latestMacIntelX64YamlObject);

// (over)writing the merged yaml files
console.info(`(over)writing the merged yaml files...\n`);
outputFileSync(TEMP_MERGED_MAC_ARTIFACTS_YAML_PATH, yamlIntelX64Dump);

// listing merged artifacts directory for files
console.info(`listing merged artifacts directory for files...\n`);
const TEMP_MERGED_ARTIFACTS = readdirSync(TEMP_MERGED_ARTIFACTS_PATH).filter(junk.not).map(file => {
  return path.resolve(TEMP_MERGED_ARTIFACTS_PATH, file);
}).filter(a => a);


// publishing the artifacts to GitHub
console.info(`publishing the artifacts to GitHub...\n`);
try {
  await runSpawn("gh", ["release",
    "create",
    gitReleaseTag,
    "--title",
    `${packageName}-${packageVersion}`,
    "--notes", // IMP: this is required to disable the interactive cli
    `# About ${packageName}-${packageVersion}`,
    ...TEMP_MERGED_ARTIFACTS
  ]);
} catch (e) {
  throw new Error(`Github release failed: ${e}`);
}

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
