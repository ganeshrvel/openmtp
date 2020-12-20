import { kalamLibPath } from '../../../app/helpers/binaries';
import { log } from '../../../app/utils/log';
import { undefinedOrNull } from '../../../app/utils/funcs';
import { checkIf } from '../../../app/utils/checkIf';
import { FILE_TRANSFER_DIRECTION } from '../../../app/enums';

const ffi = require('ffi-napi');

export class Kalam {
  constructor() {
    this.libPath = kalamLibPath;

    this.lib = ffi.Library(this.libPath, {
      Initialize: ['void', ['pointer']],
      FetchDeviceInfo: ['void', ['pointer']],
      FetchStorages: ['void', ['pointer']],
      MakeDirectory: ['void', ['pointer', 'string']],
      FileExists: ['void', ['pointer', 'string']],
      DeleteFile: ['void', ['pointer', 'string']],
      RenameFile: ['void', ['pointer', 'string']],
      Walk: ['void', ['pointer', 'string']],
      UploadFiles: ['void', ['pointer', 'pointer', 'pointer', 'string']],
      DownloadFiles: ['void', ['pointer', 'pointer', 'pointer', 'string']],
      Dispose: ['void', ['pointer']],
    });
  }

  _getNapiError(error) {
    return {
      error,
      stderr: null,
      data: null,
    };
  }

  _getData(value) {
    return {
      error: value?.error === '' ? null : value?.error,
      stderr: value?.errorType === '' ? null : value?.errorType,
      data: value?.data,
    };
  }

  /**
   * description - Initialize Kalam MTP
   *
   * @return {Promise<object>}
   * @constructor
   */
  async initialize() {
    return new Promise((resolve) => {
      try {
        const onDone = ffi.Callback('void', ['string'], (result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        });

        this.lib.Initialize.async(onDone, (err, _) => {
          if (!undefinedOrNull(err)) {
            log.error(err, 'Kalam.Initialize.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        log.error(err, 'Kalam.Initialize.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }

  /**
   * description - Fetch device information
   *
   * @return {Promise<object>}
   * @constructor
   */
  async fetchDeviceInfo() {
    return new Promise((resolve) => {
      try {
        const onDone = ffi.Callback('void', ['string'], (result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        });

        this.lib.FetchDeviceInfo.async(onDone, (err, _) => {
          if (!undefinedOrNull(err)) {
            log.error(err, 'Kalam.FetchDeviceInfo.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        log.error(err, 'Kalam.FetchDeviceInfo.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }

  /**
   * description - Fetch Storages
   *
   * @return {Promise<[string]>}
   * @constructor
   */
  async listStorages() {
    return new Promise((resolve) => {
      try {
        const onDone = ffi.Callback('void', ['string'], (result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        });

        this.lib.FetchStorages.async(onDone, (err, _) => {
          if (!undefinedOrNull(err)) {
            log.error(err, 'Kalam.FetchStorages.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        log.error(err, 'Kalam.FetchStorages.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }

  async makeDirectory({ storageId, fullPath }) {
    checkIf(storageId, 'number');
    checkIf(fullPath, 'string');

    return new Promise((resolve) => {
      try {
        const onDone = ffi.Callback('void', ['string'], (result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        });

        const _storageId = parseInt(storageId, 10);

        const args = { storageId: _storageId, fullPath };
        const json = JSON.stringify(args);

        this.lib.MakeDirectory.async(onDone, json, (err, _) => {
          if (!undefinedOrNull(err)) {
            log.error(err, 'Kalam.MakeDirectory.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        log.error(err, 'Kalam.MakeDirectory.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }

  async fileExist({ storageId, files }) {
    checkIf(storageId, 'number');
    checkIf(files, 'array');

    return new Promise((resolve) => {
      try {
        const onDone = ffi.Callback('void', ['string'], (result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        });

        const _storageId = parseInt(storageId, 10);

        const args = { storageId: _storageId, files };
        const json = JSON.stringify(args);

        this.lib.FileExists.async(onDone, json, (err, _) => {
          if (!undefinedOrNull(err)) {
            log.error(err, 'Kalam.FileExists.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        log.error(err, 'Kalam.FileExists.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }

  async deleteFile({ storageId, files }) {
    checkIf(storageId, 'number');
    checkIf(files, 'array');

    return new Promise((resolve) => {
      try {
        const onDone = ffi.Callback('void', ['string'], (result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        });

        const _storageId = parseInt(storageId, 10);

        const args = { storageId: _storageId, files };
        const json = JSON.stringify(args);

        this.lib.DeleteFile.async(onDone, json, (err, _) => {
          if (!undefinedOrNull(err)) {
            log.error(err, 'Kalam.DeleteFile.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        log.error(err, 'Kalam.DeleteFile.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }

  async renameFile({ storageId, fullPath, newFilename }) {
    checkIf(storageId, 'number');
    checkIf(fullPath, 'string');
    checkIf(newFilename, 'string');

    return new Promise((resolve) => {
      try {
        const onDone = ffi.Callback('void', ['string'], (result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        });

        const _storageId = parseInt(storageId, 10);

        const args = {
          storageId: _storageId,
          fullPath,
          newFileName: newFilename,
        };
        const json = JSON.stringify(args);

        this.lib.RenameFile.async(onDone, json, (err, _) => {
          if (!undefinedOrNull(err)) {
            log.error(err, 'Kalam.RenameFile.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        log.error(err, 'Kalam.RenameFile.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }

  /**
   * description - Walk files
   *
   * @return {Promise<[string]>}
   * @constructor
   */
  async walk({ storageId, fullPath, skipHiddenFiles }) {
    checkIf(storageId, 'number');
    checkIf(fullPath, 'string');
    checkIf(skipHiddenFiles, 'boolean');

    return new Promise((resolve) => {
      try {
        const onDone = ffi.Callback('void', ['string'], (result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        });

        const _storageId = parseInt(storageId, 10);

        const args = {
          storageId: _storageId,
          fullPath,
          recursive: false,
          skipDisallowedFiles: false,
          skipHiddenFiles,
        };
        const json = JSON.stringify(args);

        this.lib.Walk.async(onDone, json, (err, _) => {
          if (!undefinedOrNull(err)) {
            log.error(err, 'Kalam.Walk.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        log.error(err, 'Kalam.Walk.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }

  async transferFiles({
    direction,
    storageId,
    sources,
    destination,
    preprocessFiles,
    onError,
    onPreprocess,
    onProgress,
    onCompleted,
  }) {
    checkIf(direction, 'string');
    checkIf(storageId, 'number');
    checkIf(sources, 'array');
    checkIf(destination, 'string');
    checkIf(preprocessFiles, 'boolean');
    checkIf(onError, 'function');
    checkIf(onPreprocess, 'function');
    checkIf(onProgress, 'function');
    checkIf(onCompleted, 'function');

    return new Promise((resolve) => {
      try {
        const onFfiPreprocessPtr = ffi.Callback(
          'void',
          ['string'],
          (result) => {
            const json = JSON.parse(result);
            const { error, data, stderr } = this._getData(json);

            if (!undefinedOrNull(error)) {
              onError({ error, data: null, stderr });

              return resolve({ error, stderr, data: null });
            }

            if (onPreprocess && data) {
              const { fullPath, size, name } = data;

              onPreprocess({ fullPath, size, name });
            }
          }
        );

        const onFfiProgressPtr = ffi.Callback('void', ['string'], (result) => {
          const json = JSON.parse(result);
          const { error, data, stderr } = this._getData(json);

          if (!undefinedOrNull(error)) {
            onError({ error, data: null, stderr });

            return resolve({ error, stderr, data: null });
          }

          if (onProgress && data) {
            onProgress({ ...data });
          }
        });

        const onFfiDonePtr = ffi.Callback('void', ['string'], (result) => {
          const json = JSON.parse(result);

          if (onCompleted) {
            onCompleted();
          }

          return resolve(this._getData(json));
        });

        const _storageId = parseInt(storageId, 10);

        const args = {
          storageId: _storageId,
          sources,
          destination,
          preprocessFiles,
        };
        const json = JSON.stringify(args);

        let ffiFunc;

        switch (direction) {
          case FILE_TRANSFER_DIRECTION.download:
            ffiFunc = this.lib.DownloadFiles;

            break;
          case FILE_TRANSFER_DIRECTION.upload:
            ffiFunc = this.lib.UploadFiles;

            break;

          default:
            throw `unsupported 'direction' in Kalam.transferFiles`;
        }

        ffiFunc.async(
          onFfiPreprocessPtr,
          onFfiProgressPtr,
          onFfiDonePtr,
          json,
          (err, _) => {
            if (!undefinedOrNull(err)) {
              log.error(
                err,
                `Kalam.transferFiles.async - Transfer type: ${direction}`
              );

              return resolve(this._getNapiError(err));
            }
          }
        );
      } catch (err) {
        log.error(
          err,
          `Kalam.transferFiles.catch - Transfer type: ${direction}`
        );

        return resolve(this._getNapiError(err));
      }
    });
  }

  async dispose() {
    return new Promise((resolve) => {
      try {
        const onDone = ffi.Callback('void', ['string'], (result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        });

        this.lib.Dispose.async(onDone, (err, _) => {
          if (!undefinedOrNull(err)) {
            log.error(err, 'Kalam.Dispose.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        log.error(err, 'Kalam.Dispose.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }
}
