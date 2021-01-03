/* eslint-disable no-case-declarations */

import { EOL } from 'os';
import { replaceBulk, undefinedOrNull } from '../utils/funcs';
import { log } from '../utils/log';
import { isGoogleAndroidFileTransferActive } from '../utils/isGoogleAndroidFileTransferActive';
import { DEVICES_LABEL } from '../constants';
import { DEVICE_TYPE, MTP_MODE } from '../enums';
import { checkIf } from '../utils/checkIf';
import { MTP_ERROR } from '../enums/mtpError';

/**
 * Will return true if the error is a mtp detect error.
 *
 * @param {string} error
 * @param {string} stderr
 * @param {'kalam'|'legacy'} mtpMode
 */
export function isNoMtpError({ error, stderr, mtpMode }) {
  checkIf(mtpMode, 'inObjectValues', MTP_MODE);

  if (mtpMode === MTP_MODE.legacy) {
    return (
      (stderr ?? '').toLowerCase().indexOf('no mtp') !== -1 ||
      (error ?? '').toLowerCase().indexOf('no mtp') !== -1
    );
  }

  return stderr === MTP_ERROR.ErrorMtpDetectFailed;
}

export const processMtpBuffer = async ({ error, stderr, mtpMode }) => {
  checkIf(mtpMode, 'inObjectValues', MTP_MODE);

  if (mtpMode === MTP_MODE.kalam) {
    const result = await _processKalamMtpBuffer({ error, stderr });
    const noMtpError = isNoMtpError({ error, stderr, mtpMode: MTP_MODE.kalam });

    if (stderr || error) {
      // do not report no mtp error
      if (!noMtpError) {
        log.doLog(
          `MTP buffer o/p logging;${EOL}MTP Mode: ${
            MTP_MODE.kalam
          }${EOL}Raw error: ${(error ?? '').toString()}${EOL}Processed error: ${
            result.error
          }${EOL}Error type: ${stderr ?? ''}`,
          'processKalamMtpBuffer',
          null,
          result.reportError === true,
          // do not report 'device changed' error
          stderr !== MTP_ERROR.ErrorDeviceChanged
        );
      }
    }

    return result;
  }

  return _processLegacyMtpBuffer({ error, stderr });
};

export const mtpErrors = {
  [MTP_ERROR.ErrorMtpDetectFailed]: `No ${
    DEVICES_LABEL[DEVICE_TYPE.mtp]
  } or MTP device found.`,
  [MTP_ERROR.ErrorDeviceChanged]: null,
  [MTP_ERROR.ErrorMtpLockExists]: `Easy tiger! MTP is not so quick as you are`,
  [MTP_ERROR.ErrorDeviceSetup]: `An error occured while setting up the ${
    DEVICES_LABEL[DEVICE_TYPE.mtp]
  }`,
  [MTP_ERROR.ErrorDeviceLocked]: `Unlock your ${
    DEVICES_LABEL[DEVICE_TYPE.mtp]
  } and refresh again`,
  [MTP_ERROR.ErrorMultipleDevice]: 'Multiple MTP devices found',
  [MTP_ERROR.ErrorAllowStorageAccess]: `Accept MTP access to your ${
    DEVICES_LABEL[DEVICE_TYPE.mtp]
  }'s storage and refresh again`,
  [MTP_ERROR.ErrorDeviceInfo]:
    'An error occured while fetching the device information',
  [MTP_ERROR.ErrorStorageInfo]:
    'An error occured while fetching the storage information',
  [MTP_ERROR.ErrorNoStorage]: `Your ${
    DEVICES_LABEL[DEVICE_TYPE.mtp]
  } storage is inaccessible.`,
  [MTP_ERROR.ErrorStorageFull]: `${
    DEVICES_LABEL[DEVICE_TYPE.mtp]
  } storage is full`,
  [MTP_ERROR.ErrorListDirectory]: `An error occured while listing the ${
    DEVICES_LABEL[DEVICE_TYPE.mtp]
  } directory! Try again.`,
  [MTP_ERROR.ErrorFileNotFound]: 'File not found',
  [MTP_ERROR.ErrorFilePermission]: `Operation not permitted`,
  [MTP_ERROR.ErrorLocalFileRead]: `The file is inaccessible`,
  [MTP_ERROR.ErrorInvalidPath]: 'Invalid path',
  [MTP_ERROR.ErrorFileTransfer]:
    'An error occured while transferring the file! Try again.',
  [MTP_ERROR.ErrorFileObjectRead]:
    'An error occured while reading the MTP file object! Try again.',
  [MTP_ERROR.ErrorSendObject]:
    'An error occured while sending the object! Try again.',
  [MTP_ERROR.ErrorGeneral]: `Oops.. Your ${
    DEVICES_LABEL[DEVICE_TYPE.mtp]
  } has gone crazy! Try again.`,
};

/**
 *
 * Helper function for processKalamMtpBuffer
 *
 * @param [stderr] variable will hold the kalam ffi errorTypes
 * @return {Promise<{throwAlert: boolean, logError: boolean, mtpStatus: boolean, reportError: boolean, error: string}|{throwAlert: boolean, logError: boolean, mtpStatus: boolean, reportError: boolean, error: null}>}
 * @private
 */
export const _processKalamMtpBuffer = async ({ stderr }) => {
  const googleAndroidFileTransferIsActive = `Quit 'Android File Transfer' app (by Google) and Refresh`;

  let processedErrorValue = null;

  if (!undefinedOrNull(stderr)) {
    processedErrorValue = mtpErrors[stderr];
  }

  switch (stderr) {
    case MTP_ERROR.ErrorMtpDetectFailed:
    case MTP_ERROR.ErrorDeviceSetup:
      const _isGoogleAndroidFileTransferActive = await isGoogleAndroidFileTransferActive();

      if (_isGoogleAndroidFileTransferActive) {
        return {
          error: googleAndroidFileTransferIsActive,
          throwAlert: true,
          logError: true,
          mtpStatus: false,
          reportError: false,
        };
      }

      break;

    default:
      break;
  }

  switch (stderr) {
    /* No MTP device found */
    case MTP_ERROR.ErrorMtpDetectFailed:
      return {
        error: processedErrorValue,
        throwAlert: false,
        logError: false,
        mtpStatus: false,
        reportError: false,
      };

    case MTP_ERROR.ErrorStorageFull:
      return {
        error: processedErrorValue,
        throwAlert: true,
        logError: true,
        mtpStatus: false,
        reportError: false,
      };

    case MTP_ERROR.ErrorNoStorage:
      return {
        error: processedErrorValue,
        throwAlert: true,
        logError: true,
        mtpStatus: false,
        reportError: true,
      };

    case MTP_ERROR.ErrorStorageInfo:
      return {
        error: processedErrorValue,
        throwAlert: true,
        logError: true,
        mtpStatus: false,
        reportError: true,
      };

    case MTP_ERROR.ErrorDeviceInfo:
      return {
        error: processedErrorValue,
        throwAlert: true,
        logError: true,
        mtpStatus: false,
        reportError: true,
      };

    case MTP_ERROR.ErrorMultipleDevice:
      return {
        error: processedErrorValue,
        throwAlert: true,
        logError: true,
        mtpStatus: false,
        reportError: false,
      };

    case MTP_ERROR.ErrorDeviceSetup:
      return {
        error: processedErrorValue,
        throwAlert: true,
        logError: true,
        mtpStatus: false,
        reportError: true,
      };

    case MTP_ERROR.ErrorSendObject:
      return {
        error: processedErrorValue,
        throwAlert: true,
        logError: true,
        mtpStatus: true,
        reportError: true,
      };

    case MTP_ERROR.ErrorFileObjectRead:
      return {
        error: processedErrorValue,
        throwAlert: true,
        logError: true,
        mtpStatus: true,
        reportError: true,
      };

    case MTP_ERROR.ErrorFileTransfer:
      return {
        error: processedErrorValue,
        throwAlert: true,
        logError: true,
        mtpStatus: true,
        reportError: true,
      };

    case MTP_ERROR.ErrorInvalidPath:
      return {
        error: processedErrorValue,
        throwAlert: true,
        logError: true,
        mtpStatus: true,
        reportError: true,
      };

    case MTP_ERROR.ErrorLocalFileRead:
      return {
        error: processedErrorValue,
        throwAlert: true,
        logError: true,
        mtpStatus: true,
        reportError: true,
      };

    case MTP_ERROR.ErrorFilePermission:
      return {
        error: processedErrorValue,
        throwAlert: true,
        logError: true,
        mtpStatus: true,
        reportError: true,
      };

    case MTP_ERROR.ErrorFileNotFound:
      return {
        error: processedErrorValue,
        throwAlert: true,
        logError: true,
        mtpStatus: true,
        reportError: false,
      };

    case MTP_ERROR.ErrorListDirectory:
      return {
        error: processedErrorValue,
        throwAlert: true,
        logError: true,
        mtpStatus: true,
        reportError: true,
      };

    case MTP_ERROR.ErrorAllowStorageAccess:
      return {
        error: processedErrorValue,
        throwAlert: true,
        logError: true,
        mtpStatus: false,
        reportError: false,
      };

    case MTP_ERROR.ErrorDeviceChanged:
      return {
        error: processedErrorValue,
        throwAlert: false,
        logError: true,
        mtpStatus: false,
        reportError: false,
      };

    case MTP_ERROR.ErrorMtpLockExists:
      return {
        error: processedErrorValue,
        throwAlert: true,
        logError: true,
        mtpStatus: true,
        reportError: false,
      };

    case MTP_ERROR.ErrorDeviceLocked:
      return {
        error: processedErrorValue,
        throwAlert: true,
        logError: true,
        mtpStatus: false,
        reportError: false,
      };

    case MTP_ERROR.ErrorGeneral:
    default:
      return {
        error: processedErrorValue,
        throwAlert: true,
        logError: true,
        mtpStatus: true,
        reportError: true,
      };
  }
};

/**
 *
 * Helper function for processLegacyMtpBuffer
 *
 * @param [error] - error
 * @param [stderr] variable will hold the kalam ffi errorTypes
 * @return {Promise<{throwAlert: boolean, logError: boolean, mtpStatus: boolean, reportError: boolean, error: string}|{throwAlert: boolean, logError: boolean, mtpStatus: boolean, reportError: boolean, error: null}>}
 * @private
 */
export const _processLegacyMtpBuffer = async ({ error, stderr }) => {
  // Error string are used for partial error string matching
  // this will be later used to pick the appropriate error out from the [errorDictionary]
  const errorTpl = {
    noMtp: `no mtp`,
    deviceLocked: `your device may be locked`,
    invalidObjectHandle: `invalid response code InvalidObjectHandle`,
    invalidStorageID: `invalid response code InvalidStorageID`,
    fileNotFound: `could not find`,
    noFilesSelected: `No files selected`,
    invalidPath: `Invalid path`,
    noSuchFiles: `No such file or directory`,
    writePipe: `WritePipe`,
    mtpStorageNotAccessible1: `MTP storage not accessible`,
    mtpStorageNotAccessible2: `error: storage`,
    partialDeletion: `PartialDeletion`,
    noPerm1: `cannot open file`,
  };

  // Error output shown to the user as a snackbar.
  const errorDictionary = {
    noPerm: `Operation not permitted.`,
    noMtp: `No ${DEVICES_LABEL[DEVICE_TYPE.mtp]} or MTP device found.`,
    googleAndroidFileTransferIsActive: `Quit 'Android File Transfer' app (by Google) and Refresh.`,
    deviceLocked: `Unlock your ${
      DEVICES_LABEL[DEVICE_TYPE.mtp]
    } and refresh again`,
    unResponsive: `Your ${
      DEVICES_LABEL[DEVICE_TYPE.mtp]
    } is not responding. Reload or reconnect the device.`,
    mtpStorageNotAccessible: `Your ${
      DEVICES_LABEL[DEVICE_TYPE.mtp]
    } storage is not accessible.`,
    fileNotFound: `File not found! Try again.`,
    partialDeletion: `The path is inaccessible.`,
    common: `Oops.. Your ${
      DEVICES_LABEL[DEVICE_TYPE.mtp]
    } has gone crazy! Try again.`,
  };

  const errorStringified =
    typeof error !== 'undefined' && error !== null ? error.toString() : '';
  const stderrStringified =
    typeof stderr !== 'undefined' && stderr !== null ? stderr.toString() : '';

  if (!errorStringified && !stderrStringified) {
    return {
      error: null,
      throwAlert: false,
      logError: true,
      mtpStatus: true,
    };
  }

  const checkError = (errorTplKey) => {
    return (
      stderrStringified
        .toLowerCase()
        .indexOf(errorTpl[errorTplKey].toLowerCase()) !== -1 ||
      errorStringified
        .toLowerCase()
        .indexOf(errorTpl[errorTplKey].toLowerCase()) !== -1
    );
  };

  const noMtpError = isNoMtpError({ error, stderr, mtpMode: MTP_MODE.legacy });

  if (!noMtpError) {
    log.doLog(
      `MTP buffer o/p logging;${EOL}MTP Mode: ${
        MTP_MODE.legacy
      }${EOL}error: ${errorStringified.trim()}${EOL}stderr: ${stderrStringified.trim()}`,
      'processLegacyMtpBuffer'
    );
  }

  if (
    /* No MTP device found */
    noMtpError
  ) {
    const _isGoogleAndroidFileTransferActive = await isGoogleAndroidFileTransferActive();

    if (_isGoogleAndroidFileTransferActive) {
      return {
        error: errorDictionary.googleAndroidFileTransferIsActive,
        throwAlert: true,
        logError: true,
        mtpStatus: false,
        reportError: false,
      };
    }

    return {
      error: errorDictionary.noMtp,
      throwAlert: false,
      logError: false,
      mtpStatus: false,

      reportError: false,
    };
  }

  if (
    /* MTP device may be locked */
    checkError('deviceLocked')
  ) {
    return {
      error: errorDictionary.deviceLocked,
      throwAlert: true,
      logError: true,
      mtpStatus: false,

      reportError: false,
    };
  }

  if (
    /* error: Get: invalid response code InvalidObjectHandle (0x2009) */
    checkError('invalidObjectHandle')
  ) {
    return {
      error: errorDictionary.unResponsive,
      throwAlert: true,
      logError: true,
      mtpStatus: false,

      reportError: true,
    };
  }

  if (
    /* error: Get: invalid response code InvalidStorageID */
    checkError('invalidStorageID')
  ) {
    return {
      error: errorDictionary.unResponsive,
      throwAlert: true,
      logError: true,
      mtpStatus: false,
      reportError: true,
    };
  }

  if (
    /* error: (*interface)->WritePipe(interface, ep->GetRefIndex(), buffer.data(), r): error 0xe00002eb */
    checkError('writePipe')
  ) {
    return {
      error: errorDictionary.unResponsive,
      throwAlert: true,
      logError: true,
      mtpStatus: false,
      reportError: true,
    };
  }

  if (
    /* MTP storage not accessible */
    checkError('mtpStorageNotAccessible1') ||
    checkError('mtpStorageNotAccessible2')
  ) {
    return {
      error: errorDictionary.mtpStorageNotAccessible,
      throwAlert: true,
      logError: true,
      mtpStatus: false,
      reportError: true,
    };
  }

  if (
    /* Path not found */
    checkError('fileNotFound')
  ) {
    return {
      error: sanitizeErrors(stderrStringified || errorStringified),
      throwAlert: true,
      logError: true,
      mtpStatus: true,
      reportError: true,
    };
  }

  if (
    /* No Permission */
    checkError('noPerm1')
  ) {
    return {
      error: errorDictionary.noPerm,
      throwAlert: true,
      logError: true,
      mtpStatus: true,
      reportError: true,
    };
  }

  if (
    /* No such file or directory */
    checkError('noSuchFiles')
  ) {
    return {
      error: errorDictionary.fileNotFound,
      throwAlert: true,
      logError: true,
      mtpStatus: true,
      reportError: true,
    };
  }

  if (
    /* No files selected */
    checkError('noFilesSelected') ||
    checkError('invalidPath')
  ) {
    return {
      error: sanitizeErrors(stderrStringified || errorStringified),
      throwAlert: true,
      logError: true,
      mtpStatus: true,
      reportError: true,
    };
  }

  if (
    /* No files selected */
    checkError('partialDeletion')
  ) {
    return {
      error: errorDictionary.partialDeletion,
      throwAlert: true,
      logError: true,
      mtpStatus: true,
      reportError: true,
    };
  }

  /* common errors */
  return {
    error: errorDictionary.common,
    throwAlert: true,
    logError: true,
    mtpStatus: true,
    reportError: true,
  };
};

export const processLocalBuffer = ({ error, stderr }) => {
  // Partial error string used for matching the error
  // this will be later used to pick the appropriate error out from the [errorDictionary]
  const errorTpl = {
    noPerm1: `Operation not permitted`,
    noPerm2: `Permission denied`,
    commandFailed: `Command failed`,
    noSuchFiles: `No such file or directory`,
    resourceBusy: `resource busy or locked`,
  };

  // Error output shown to the user as a snackbar.
  const errorDictionary = {
    noPerm: `Operation not permitted.`,
    commandFailed: `Could not complete! Try again.`,
    common: `Oops.. Your device has gone crazy! Try again.`,
    unResponsive: `Device is not responding! Reload`,
    invalidPath: `Invalid path`,
    fileNotFound: `File not found! Try again.`,
  };

  const errorStringified =
    typeof error !== 'undefined' && error !== null ? error.toString() : '';
  const stderrStringified =
    typeof stderr !== 'undefined' && stderr !== null ? stderr.toString() : '';

  if (!errorStringified && !stderrStringified) {
    return {
      error: null,
      throwAlert: false,
      logError: true,
    };
  }

  const checkError = (errorTplKey) => {
    return (
      stderrStringified
        .toLowerCase()
        .indexOf(errorTpl[errorTplKey].toLowerCase()) !== -1 ||
      errorStringified
        .toLowerCase()
        .indexOf(errorTpl[errorTplKey].toLowerCase()) !== -1
    );
  };

  log.doLog(
    `Local buffer o/p logging;${EOL}error: ${errorStringified.trim()}${EOL}stderr: ${stderrStringified.trim()}`,
    'processLocalBuffer'
  );

  if (
    /* No Permission */
    checkError('noPerm1') ||
    checkError('noPerm2')
  ) {
    return {
      error: errorDictionary.noPerm,
      throwAlert: true,
      logError: true,
    };
  }

  if (
    /* Command failed */
    checkError('commandFailed')
  ) {
    return {
      error: errorDictionary.commandFailed,
      throwAlert: true,
      logError: true,
    };
  }

  if (
    /* No such file or directory */
    checkError('noSuchFiles')
  ) {
    return {
      error: errorDictionary.fileNotFound,
      throwAlert: true,
      logError: true,
      mtpStatus: true,
    };
  }

  if (
    /* Resource busy or locked */
    checkError('resourceBusy')
  ) {
    return {
      error: errorDictionary.commandFailed,
      throwAlert: true,
      logError: true,
    };
  }

  /* common errors */
  return {
    error: errorDictionary.common,
    throwAlert: true,
    logError: true,
  };
};

const sanitizeErrors = (string) => {
  if (string === null) {
    return `Oops.. Try again`;
  }

  string = string.replace(/^(error: )/, '').trim(); // eslint-disable-line no-param-reassign
  string = replaceBulk(string, ['error:', 'stat failed:'], ['', '']).trim(); // eslint-disable-line no-param-reassign

  return string.charAt(0).toUpperCase() + string.slice(1);
};
