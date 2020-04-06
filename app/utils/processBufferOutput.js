'use strict';

import { EOL } from 'os';
import { replaceBulk } from './funcs';
import { log } from './log';
import { isGoogleAndroidFileTransferActive } from './isGoogleAndroidFileTransferActive';
import { DEVICES_LABEL, DEVICES_TYPE_CONST } from '../constants';

export const processMtpBuffer = async ({ error, stderr }) => {
  const errorTpl = {
    noMtp: ``,
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
    partialDeletion: `PartialDeletion`
  };

  const errorDictionary = {
    noMtp: `No ${DEVICES_LABEL[DEVICES_TYPE_CONST.mtp]} or MTP device found.`,
    googleAndroidFileTransferIsActive: `Quit 'Android File Transfer' app (by Google) and reload.`,
    deviceLocked: `Your ${
      DEVICES_LABEL[DEVICES_TYPE_CONST.mtp]
    } may be locked. Unlock it and reload.`,
    unResponsive: `Your ${
      DEVICES_LABEL[DEVICES_TYPE_CONST.mtp]
    } is not responding. Reload or reconnect the device.`,
    mtpStorageNotAccessible: `Your ${
      DEVICES_LABEL[DEVICES_TYPE_CONST.mtp]
    } storage is not accessible.`,
    fileNotFound: `File not found! Try again.`,
    partialDeletion: `The path is inaccessible.`,
    common: `Oops.. Your ${
      DEVICES_LABEL[DEVICES_TYPE_CONST.mtp]
    } has gone crazy! Try again.`
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
      status: true
    };
  }

  const checkError = errorTplKey => {
    return (
      stderrStringified
        .toLowerCase()
        .indexOf(errorTpl[errorTplKey].toLowerCase()) !== -1 ||
      errorStringified
        .toLowerCase()
        .indexOf(errorTpl[errorTplKey].toLowerCase()) !== -1
    );
  };

  const noMtpError = checkError('noMtp');
  log.doLog(
    `MTP buffer o/p logging;${EOL}error: ${errorStringified.trim()}${EOL}stderr: ${stderrStringified.trim()}`,
    !noMtpError
  );

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
        status: false
      };
    }

    return {
      error: errorDictionary.noMtp,
      throwAlert: false,
      logError: false,
      status: false
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
      status: false
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
      status: false
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
      status: false
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
      status: false
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
      status: false
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
      status: true
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
      status: true
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
      status: true
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
      status: true
    };
  }
  /* common errors */
  return {
    error: errorDictionary.common,
    throwAlert: true,
    logError: true,
    status: true
  };
};

export const processLocalBuffer = ({ error, stderr }) => {
  const errorTpl = {
    noPerm1: `Operation not permitted`,
    noPerm2: `Permission denied`,
    commandFailed: `Command failed`,
    noSuchFiles: `No such file or directory`,
    resourceBusy: `resource busy or locked`
  };
  const errorDictionary = {
    noPerm: `Operation not permitted.`,
    commandFailed: `Could not complete! Try again.`,
    common: `Oops.. Your device has gone crazy! Try again.`,
    unResponsive: `Device is not responding! Reload`,
    invalidPath: `Invalid path`,
    fileNotFound: `File not found! Try again.`
  };

  const errorStringified =
    typeof error !== 'undefined' && error !== null ? error.toString() : '';
  const stderrStringified =
    typeof stderr !== 'undefined' && stderr !== null ? stderr.toString() : '';

  if (!errorStringified && !stderrStringified) {
    return {
      error: null,
      throwAlert: false,
      logError: true
    };
  }

  const checkError = errorTplKey => {
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
    `Local buffer o/p logging;${EOL}error: ${errorStringified.trim()}${EOL}stderr: ${stderrStringified.trim()}`
  );

  if (
    /* No Permission */
    checkError('noPerm1') ||
    checkError('noPerm2')
  ) {
    return {
      error: errorDictionary.noPerm,
      throwAlert: true,
      logError: true
    };
  }
  if (
    /* Command failed */
    checkError('commandFailed')
  ) {
    return {
      error: errorDictionary.commandFailed,
      throwAlert: true,
      logError: true
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
      status: true
    };
  }
  if (
    /* Resource busy or locked */
    checkError('resourceBusy')
  ) {
    return {
      error: errorDictionary.commandFailed,
      throwAlert: true,
      logError: true
    };
  }
  /* common errors */
  return {
    error: errorDictionary.common,
    throwAlert: true,
    logError: true
  };
};

const sanitizeErrors = string => {
  if (string === null) {
    return `Oops.. Try again`;
  }
  string = string.replace(/^(error: )/, '').trim(); // eslint-disable-line no-param-reassign
  string = replaceBulk(string, ['error:', 'stat failed:'], ['', '']).trim(); // eslint-disable-line no-param-reassign

  return string.charAt(0).toUpperCase() + string.slice(1);
};
