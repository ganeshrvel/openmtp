const ffi = require('ffi-napi');

export class Kalam {
  constructor() {
    this.libPath = 'build/mac/bin/kalam.dylib';

    this.lib = ffi.Library(this.libPath, {
      Initialize: ['void', ['pointer']],
      FetchDeviceInfo: ['void', ['pointer']],
      FetchStorages: ['void', ['pointer']],
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
    console.time('Function #1');

    const cb = ffi.Callback('void', ['string'], (result) => {
      const json = JSON.parse(result);

      console.timeEnd('Function #1');

      console.log('result: ', json);
    });

    await new Promise((resolve) => {
      try {
        this.lib.Initialize.async(cb, (err, res) => {
          console.error(err);
          console.error(res);

          resolve(res);
        });
      } catch (e) {
        console.error(e);
        resolve(null);
      }
    });
  }

  async FetchStorages() {
    const cb = ffi.Callback('void', ['string'], (result) => {
      console.time('Function #1');
      const json = JSON.parse(result);

      console.timeEnd('Function #1');

      console.log('result: ', json);
    });

    await new Promise((resolve) => {
      try {
        this.lib.FetchStorages.async(cb, (err, res) => {
          resolve(res);
        });
      } catch (e) {
        console.error(e);
        resolve(null);
      }
    });
  }
}

const kalamFfi = new Kalam();

export default kalamFfi;
