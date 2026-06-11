import koffi from 'koffi';
import { undefinedOrNull } from '../../../app/utils/funcs';
import { checkIf } from '../../../app/utils/checkIf';
import { FILE_TRANSFER_DIRECTION } from '../../../app/enums';

/**
 * KalamEngine
 *
 * Electron-free binding to the native `kalam.dylib` MTP engine ("Kalam" mode).
 *
 * This class contains the entire koffi FFI contract used by OpenMTP to talk to
 * the native engine (device enumeration, directory walk, upload, download,
 * etc.). It deliberately has *no* dependency on the Electron runtime, Sentry,
 * `electron-root-path`, redux, or any GUI module. Both consumers share it:
 *
 *   - The GUI, via the thin {@link Kalam} subclass which injects the
 *     Electron-resolved `kalamLibPath` and the Sentry-backed `log`.
 *   - The MTP CLI (`ffi/kalam/cli`), which injects a plain-Node resolved dylib
 *     path and a `console`-style logger so the same engine can be driven from
 *     a terminal / scripts without launching Electron.
 *
 * The native engine is what lets OpenMTP claim the MTP USB interface on macOS
 * where `libmtp`/`libusb` userspace tools fail with
 * `libusb_claim_interface() = -3` (LIBUSB_ERROR_ACCESS).
 */
export class KalamEngine {
  /**
   * @param {Object} options
   * @param {string} options.libPath - Absolute path to `kalam.dylib`.
   * @param {Object} [options.logger] - Logger exposing `error(err, tag)`.
   *   Defaults to `console`.
   */
  constructor({ libPath, logger } = {}) {
    if (undefinedOrNull(libPath)) {
      throw new Error('KalamEngine requires a `libPath` to kalam.dylib');
    }

    this.libPath = libPath;
    this.log = logger ?? console;
    this.lib = koffi.load(this.libPath);

    this.callbackDictionary = Object.freeze({
      onCbResult: koffi.proto('void on_cb_result_t(char*)'),
    });

    this.fnDictionary = Object.freeze({
      Initialize: 'void Initialize(on_cb_result_t* onDonePtr)',
      FetchDeviceInfo: 'void FetchDeviceInfo(on_cb_result_t* onDonePtr)',
      FetchStorages: 'void FetchStorages(on_cb_result_t* onDonePtr)',
      FileExists:
        'void FileExists(char* fileExistsInputJson, on_cb_result_t* onDonePtr)',
      DeleteFile:
        'void DeleteFile(char* deleteFileInputJson, on_cb_result_t* onDonePtr)',
      MakeDirectory:
        'void MakeDirectory(char* makeDirectoryInputJson, on_cb_result_t* onDonePtr)',
      RenameFile:
        'void RenameFile(char* renameFileInputJson, on_cb_result_t* onDonePtr)',
      Walk: 'void Walk(char* walkInputJson, on_cb_result_t* onDonePtr)',
      DownloadFiles:
        'void DownloadFiles(char* downloadFilesInputJson, on_cb_result_t* onPreprocessPtr, on_cb_result_t* onProgressPtr, on_cb_result_t* onDonePtr)',
      UploadFiles:
        'void UploadFiles(char* uploadFilesInputJson, on_cb_result_t* onPreprocessPtr, on_cb_result_t* onProgressPtr, on_cb_result_t* onDonePtr)',
      Dispose: 'void Dispose(on_cb_result_t* onDonePtr)',
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
   */
  async initialize() {
    return new Promise((resolve) => {
      try {
        const onDonePtr = this.callbackDictionary.onCbResult;
        const rawOnDonePtr = koffi.register((result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        }, koffi.pointer(onDonePtr));

        const Initialize = this.lib.func(this.fnDictionary.Initialize);

        Initialize.async(rawOnDonePtr, (err, _) => {
          koffi.unregister(rawOnDonePtr);

          if (!undefinedOrNull(err)) {
            this.log.error(err, 'KalamEngine.Initialize.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        this.log.error(err, 'KalamEngine.Initialize.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }

  /**
   * description - Fetch device information
   *
   * @return {Promise<object>}
   */
  async fetchDeviceInfo() {
    return new Promise((resolve) => {
      try {
        const onDonePtr = this.callbackDictionary.onCbResult;
        const rawOnDonePtr = koffi.register((result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        }, koffi.pointer(onDonePtr));

        const FetchDeviceInfo = this.lib.func(
          this.fnDictionary.FetchDeviceInfo
        );

        FetchDeviceInfo.async(rawOnDonePtr, (err, _) => {
          koffi.unregister(rawOnDonePtr);

          if (!undefinedOrNull(err)) {
            this.log.error(err, 'KalamEngine.FetchDeviceInfo.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        this.log.error(err, 'KalamEngine.FetchDeviceInfo.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }

  /**
   * description - Fetch Storages
   *
   * @return {Promise<[string]>}
   */
  async listStorages() {
    return new Promise((resolve) => {
      try {
        const onDonePtr = this.callbackDictionary.onCbResult;
        const rawOnDonePtr = koffi.register((result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        }, koffi.pointer(onDonePtr));

        const FetchStorages = this.lib.func(this.fnDictionary.FetchStorages);

        FetchStorages.async(rawOnDonePtr, (err, _) => {
          koffi.unregister(rawOnDonePtr);

          if (!undefinedOrNull(err)) {
            this.log.error(err, 'KalamEngine.FetchStorages.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        this.log.error(err, 'KalamEngine.FetchStorages.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }

  async makeDirectory({ storageId, fullPath }) {
    checkIf(storageId, 'number');
    checkIf(fullPath, 'string');

    return new Promise((resolve) => {
      try {
        const onDonePtr = this.callbackDictionary.onCbResult;
        const rawOnDonePtr = koffi.register((result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        }, koffi.pointer(onDonePtr));

        const MakeDirectory = this.lib.func(this.fnDictionary.MakeDirectory);

        const _storageId = parseInt(storageId, 10);
        const args = { storageId: _storageId, fullPath };
        const json = JSON.stringify(args);

        MakeDirectory.async(json, rawOnDonePtr, (err, _) => {
          koffi.unregister(rawOnDonePtr);

          if (!undefinedOrNull(err)) {
            this.log.error(err, 'KalamEngine.MakeDirectory.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        this.log.error(err, 'KalamEngine.MakeDirectory.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }

  async fileExist({ storageId, files }) {
    checkIf(storageId, 'number');
    checkIf(files, 'array');

    return new Promise((resolve) => {
      try {
        const onDonePtr = this.callbackDictionary.onCbResult;
        const rawOnDonePtr = koffi.register((result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        }, koffi.pointer(onDonePtr));

        const FileExists = this.lib.func(this.fnDictionary.FileExists);

        const _storageId = parseInt(storageId, 10);

        const args = { storageId: _storageId, files };
        const json = JSON.stringify(args);

        FileExists.async(json, rawOnDonePtr, (err, _) => {
          koffi.unregister(rawOnDonePtr);

          if (!undefinedOrNull(err)) {
            this.log.error(err, 'KalamEngine.FileExists.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        this.log.error(err, 'KalamEngine.FileExists.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }

  async deleteFile({ storageId, files }) {
    checkIf(storageId, 'number');
    checkIf(files, 'array');

    return new Promise((resolve) => {
      try {
        const onDonePtr = this.callbackDictionary.onCbResult;
        const rawOnDonePtr = koffi.register((result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        }, koffi.pointer(onDonePtr));

        const DeleteFile = this.lib.func(this.fnDictionary.DeleteFile);

        const _storageId = parseInt(storageId, 10);

        const args = { storageId: _storageId, files };
        const json = JSON.stringify(args);

        DeleteFile.async(json, rawOnDonePtr, (err, _) => {
          koffi.unregister(rawOnDonePtr);

          if (!undefinedOrNull(err)) {
            this.log.error(err, 'KalamEngine.DeleteFile.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        this.log.error(err, 'KalamEngine.DeleteFile.catch');

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
        const onDonePtr = this.callbackDictionary.onCbResult;
        const rawOnDonePtr = koffi.register((result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        }, koffi.pointer(onDonePtr));

        const RenameFile = this.lib.func(this.fnDictionary.RenameFile);

        const _storageId = parseInt(storageId, 10);

        const args = {
          storageId: _storageId,
          fullPath,
          newFileName: newFilename,
        };
        const json = JSON.stringify(args);

        RenameFile.async(json, rawOnDonePtr, (err, _) => {
          koffi.unregister(rawOnDonePtr);

          if (!undefinedOrNull(err)) {
            this.log.error(err, 'KalamEngine.RenameFile.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        this.log.error(err, 'KalamEngine.RenameFile.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }

  /**
   * description - Walk files
   *
   * @return {Promise<[string]>}
   */
  async walk({ storageId, fullPath, skipHiddenFiles }) {
    checkIf(storageId, 'number');
    checkIf(fullPath, 'string');
    checkIf(skipHiddenFiles, 'boolean');

    return new Promise((resolve) => {
      try {
        const onDonePtr = this.callbackDictionary.onCbResult;
        const rawOnDonePtr = koffi.register((result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        }, koffi.pointer(onDonePtr));

        const Walk = this.lib.func(this.fnDictionary.Walk);

        const _storageId = parseInt(storageId, 10);

        const args = {
          storageId: _storageId,
          fullPath,
          recursive: false,
          skipDisallowedFiles: false,
          skipHiddenFiles,
        };
        const json = JSON.stringify(args);

        Walk.async(json, rawOnDonePtr, (err, _) => {
          koffi.unregister(rawOnDonePtr);

          if (!undefinedOrNull(err)) {
            this.log.error(err, 'KalamEngine.Walk.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        this.log.error(err, 'KalamEngine.Walk.catch');

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
        const onFfiPreprocessPtr = this.callbackDictionary.onCbResult;
        const rawOnFfiPreprocessPtr = koffi.register((result) => {
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
        }, koffi.pointer(onFfiPreprocessPtr));

        const onFfiProgressPtr = this.callbackDictionary.onCbResult;
        const rawOnFfiProgressPtr = koffi.register((result) => {
          const json = JSON.parse(result);
          const { error, data, stderr } = this._getData(json);

          if (!undefinedOrNull(error)) {
            onError({ error, data: null, stderr });

            return resolve({ error, stderr, data: null });
          }

          if (onProgress && data) {
            onProgress({ ...data });
          }
        }, koffi.pointer(onFfiProgressPtr));

        const onDonePtr = this.callbackDictionary.onCbResult;
        const rawOnDonePtr = koffi.register((result) => {
          const json = JSON.parse(result);

          if (onCompleted) {
            onCompleted();
          }

          return resolve(this._getData(json));
        }, koffi.pointer(onDonePtr));

        let TransferFiles;

        switch (direction) {
          case FILE_TRANSFER_DIRECTION.download:
            TransferFiles = this.lib.func(this.fnDictionary.DownloadFiles);

            break;
          case FILE_TRANSFER_DIRECTION.upload:
            TransferFiles = this.lib.func(this.fnDictionary.UploadFiles);

            break;

          default:
            return resolve(
              this._getNapiError(
                `unsupported 'direction' in KalamEngine.transferFiles`
              )
            );
        }

        const _storageId = parseInt(storageId, 10);

        const args = {
          storageId: _storageId,
          sources,
          destination,
          preprocessFiles,
        };
        const json = JSON.stringify(args);

        TransferFiles.async(
          json,
          rawOnFfiPreprocessPtr,
          rawOnFfiProgressPtr,
          rawOnDonePtr,
          (err, _) => {
            koffi.unregister(rawOnFfiPreprocessPtr);
            koffi.unregister(rawOnFfiProgressPtr);
            koffi.unregister(rawOnDonePtr);

            if (!undefinedOrNull(err)) {
              this.log.error(
                err,
                `KalamEngine.transferFiles.async - Transfer type: ${direction}`
              );

              return resolve(this._getNapiError(err));
            }
          }
        );
      } catch (err) {
        this.log.error(
          err,
          `KalamEngine.transferFiles.catch - Transfer type: ${direction}`
        );

        return resolve(this._getNapiError(err));
      }
    });
  }

  async dispose() {
    return new Promise((resolve) => {
      try {
        const onDonePtr = this.callbackDictionary.onCbResult;
        const rawOnDonePtr = koffi.register((result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        }, koffi.pointer(onDonePtr));

        const Dispose = this.lib.func(this.fnDictionary.Dispose);

        Dispose.async(rawOnDonePtr, (err, _) => {
          koffi.unregister(rawOnDonePtr);

          if (!undefinedOrNull(err)) {
            this.log.error(err, 'KalamEngine.Dispose.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        this.log.error(err, 'KalamEngine.Dispose.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }
}
