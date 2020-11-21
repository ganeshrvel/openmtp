import { kalamLibPath } from '../../../app/utils/binaries';
import { log } from '../../../app/utils/log';
import { undefinedOrNull } from '../../../app/utils/funcs';

const ffi = require('ffi-napi');

export class Kalam {
  constructor() {
    this.libPath = kalamLibPath;

    this.lib = ffi.Library(this.libPath, {
      Initialize: ['void', ['pointer']],
      FetchDeviceInfo: ['void', ['pointer']],
      FetchStorages: ['void', ['pointer']],
      Dispose: ['void', ['pointer']],
      // UploadFiles: ['void', ['pointer']],
      // Walk: ['void', ['string', 'int', 'pointer']],
      // DownloadFiles: ['void', ['string', 'string', 'pointer']],
      // Add: ['longlong', ['longlong', 'longlong']],
      // Cosine: ['double', ['double']],
      // Sort: ['void', [GoSlice]],
      // Log: ['longlong', [GoString]]
    });
  }

  _getError(error) {
    return {
      error,
      stderr: null,
      data: null,
    };
  }

  _getData(data) {
    //todo fix the return value
    return {
      error: null,
      stderr: null,
      data,
    };
  }

  async InitializeMtp() {
    await new Promise((resolve) => {
      try {
        const cb = ffi.Callback('void', ['string'], (result) => {
          const json = JSON.parse(result);

          console.log('InitializeMtp: ', json);

          return resolve(this._getData(json));
        });

        this.lib.Initialize.async(cb, (err, _) => {
          if (!undefinedOrNull(err)) {
            log.error(err, 'Kalam.Initialize.async');

            return resolve(this._getError(err));
          }
        });
      } catch (err) {
        log.error(err, 'Kalam.Initialize.catch');

        return resolve(this._getError(err));
      }
    });
  }

  async FetchDeviceInfo() {
    await new Promise((resolve) => {
      try {
        const cb = ffi.Callback('void', ['string'], (result) => {
          const json = JSON.parse(result);

          console.log('FetchDeviceInfo: ', json);

          return resolve(this._getData(json));
        });

        this.lib.FetchDeviceInfo.async(cb, (err, _) => {
          if (!undefinedOrNull(err)) {
            log.error(err, 'Kalam.FetchDeviceInfo.async');

            return resolve(this._getError(err));
          }
        });
      } catch (err) {
        log.error(err, 'Kalam.FetchDeviceInfo.catch');

        return resolve(this._getError(err));
      }
    });
  }

  async FetchStorages() {
    await new Promise((resolve) => {
      try {
        const cb = ffi.Callback('void', ['string'], (result) => {
          const json = JSON.parse(result);

          console.log('FetchStorages: ', json);

          return resolve(this._getData(json));
        });

        this.lib.FetchStorages.async(cb, (err, _) => {
          if (!undefinedOrNull(err)) {
            log.error(err, 'Kalam.FetchStorages.async');

            return resolve(this._getError(err));
          }
        });
      } catch (err) {
        log.error(err, 'Kalam.FetchStorages.catch');

        return resolve(this._getError(err));
      }
    });
  }

  async Dispose() {
    await new Promise((resolve) => {
      try {
        const cb = ffi.Callback('void', ['string'], (result) => {
          const json = JSON.parse(result);

          console.log('Dispose: ', json);

          return resolve(this._getData(json));
        });

        this.lib.Dispose.async(cb, (err, _) => {
          if (!undefinedOrNull(err)) {
            log.error(err, 'Kalam.Dispose.async');

            return resolve(this._getError(err));
          }
        });
      } catch (err) {
        log.error(err, 'Kalam.Dispose.catch');

        return resolve(this._getError(err));
      }
    });
  }
}

const kalamFfi = new Kalam();

export default kalamFfi;
