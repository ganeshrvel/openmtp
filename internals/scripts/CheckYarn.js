const { execSync } = require('child_process');
const semver = require('semver');

const requiredVersionRange = '>=6.x <=8.16.0';

try {
  const npmVersion = execSync('npm -v').toString().trim();

  if (!semver.satisfies(npmVersion, requiredVersionRange)) {
    console.error(
      `Error: This project requires npm version ${requiredVersionRange}. You have version ${npmVersion}.\nPlease downgrade your npm, this is due to a bug in node-gyp. Github issue: https://github.com/ganeshrvel/openmtp/issues/367.\ncommand: npm install -g npm@8.16.0`
    );
    process.exit(1);
  }

  console.info(`Using compatible npm version: ${npmVersion}`);
} catch (error) {
  console.error('Error checking npm version:', error);

  process.exit(1);
}

if (!/yarn\.js$/.test(process.env.npm_execpath || '')) {
  console.warn(
    "\u001b[33mYou don't seem to be using yarn. This could produce unexpected results.\u001b[39m"
  );
}
