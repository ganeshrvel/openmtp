'use strict';

export const mailToInstructions = zippedLogFileBaseName =>
  `%0D%0A %0D%0A Attach the generated error report file "${zippedLogFileBaseName}" (which is found in your Desktop folder) along with this email.`;

export const reportGenerateError = `Error report generation failed. Try again!`;
