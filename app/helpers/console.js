import clp from 'console-log-plus';

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

console.warn = logWarning;

clp({
  color: 'orange',
  message: `Warning: React depreciation warnings are disabled.\n Edit 'app/helpers/console.js' to enable them`,
});
