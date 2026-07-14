/* eslint-disable no-case-declarations */

import { EOL } from 'os';
import { undefinedOrNull } from '../utils/funcs';
import { log } from '../utils/log';
import { isGoogleAndroidFileTransferActive } from '../utils/isGoogleAndroidFileTransferActive';
import { DEVICES_LABEL } from '../constants';
import { DEVICE_TYPE, MTP_MODE } from '../enums';
import { MTP_ERROR } from '../enums/mtpError';

/**
 * Will return true if the error is a mtp detect error.
 *
 * @param {string} stderr
 */
export function isNoMtpError({ stderr }) {
  return stderr === MTP_ERROR.ErrorMtpDetectFailed;
}

export const processMtpBuffer = async ({ error, stderr }) => {
  const result = await _processKalamMtpBuffer({ error, stderr });
  const noMtpError = isNoMtpError({ stderr });

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
        stderr !== MTP_ERROR.ErrorDeviceChanged,
      );
    }
  }

  return result;
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
      const _isGoogleAndroidFileTransferActive =
        await isGoogleAndroidFileTransferActive();

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

// Error output shown to the user as a snackbar.
export const localErrorDictionary = {
  noPerm: `Operation not permitted`,
  commandFailed: `Could not complete! Try again.`,
  common: `Oops.. Your device has gone crazy! Try again.`,
  unResponsive: `Device is not responding! Reload`,
  invalidPath: `Invalid path`,
  fileNotFound: `File not found! Try again.`,
};

export const processLocalBuffer = ({ error, stderr }) => {
  // Partial error string used for matching the error
  // this will be later used to pick the appropriate error out from the [localErrorDictionary]
  const errorTpl = {
    noPerm1: `Operation not permitted`,
    noPerm2: `Permission denied`,
    commandFailed: `Command failed`,
    noSuchFiles: `No such file or directory`,
    resourceBusy: `resource busy or locked`,
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
    'processLocalBuffer',
  );

  if (
    /* No Permission */
    checkError('noPerm1') ||
    checkError('noPerm2')
  ) {
    return {
      error: localErrorDictionary.noPerm,
      throwAlert: true,
      logError: true,
    };
  }

  if (
    /* Command failed */
    checkError('commandFailed')
  ) {
    return {
      error: localErrorDictionary.commandFailed,
      throwAlert: true,
      logError: true,
    };
  }

  if (
    /* No such file or directory */
    checkError('noSuchFiles')
  ) {
    return {
      error: localErrorDictionary.fileNotFound,
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
      error: localErrorDictionary.commandFailed,
      throwAlert: true,
      logError: true,
    };
  }

  /* common errors */
  return {
    error: localErrorDictionary.common,
    throwAlert: true,
    logError: true,
  };
};
