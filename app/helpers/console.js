import clp from 'console-log-plus';
import { ENV_FLAVOR } from '../constants/env';

const { warn } = console;

function logWarning(...warnings) {
  let showWarning = true;

  warnings.forEach((warning) => {
    if (warning.includes('UNSAFE_')) showWarning = false;
    else if (warning.includes('SourceMap')) showWarning = false;
    else if (warning.includes('DevTools')) showWarning = false;
  });

  if (showWarning) {
    warn(...warnings);
  }
}

if (ENV_FLAVOR.disableReactWarnings) {
  console.warn = logWarning;

  clp({
    color: 'orange',
    message: `Warning: React depreciation warnings are disabled.\n Edit 'app/helpers/console.js' to enable them`,
  });
}
