const ffi = require('ffi-napi');

export class Kalam {
  constructor() {
    this.libPath = 'build/mac/bin/kalam.dylib';

    this.lib = ffi.Library(this.libPath, {
      Initialize: ['void', []],
      FetchDeviceInfo: ['void', []],
      FetchStorages: ['int', []],
      // UploadFiles: ['void', ['pointer']],
      // Walk: ['void', ['string', 'int', 'pointer']],
      // DownloadFiles: ['void', ['string', 'string', 'pointer']],
      // Add: ['longlong', ['longlong', 'longlong']],
      // Cosine: ['double', ['double']],
      // Sort: ['void', [GoSlice]],
      // Log: ['longlong', [GoString]]
    });
  }

  async InitializeMtp() {
    await new Promise((resolve) => {
      try {
        this.lib.Initialize.async((err, res) => {
          resolve(res);
        });
      } catch (e) {
        resolve(null);
      }
    });
  }

  async FetchStorages() {
    await new Promise((resolve) => {
      try {
        this.lib.FetchStorages.async((err, res) => {
          resolve(res);
        });
      } catch (e) {
        resolve(null);
      }
    });
  }
}

const kalamFfi = new Kalam();

export default kalamFfi;
