// const ffi = require('ffi-napi');
//
// function isNullOrUndefined(s) {
//   return typeof s === 'undefined' || s == null;
// }
//
// async function run() {
//   // define foreign functions
//   setInterval(() => {
//     console.log('before 1');
//   }, 500);
//
//   const kalam = ffi.Library('./lib/native/kalam.dylib', {
//     Initialize: ['void', []],
//     FetchDeviceInfo: ['void', []],
//     FetchStorages: ['int', []],
//     UploadFiles: ['void', ['pointer']],
//     Walk: ['void', ['string', 'int', 'pointer']],
//     DownloadFiles: ['void', ['string', 'string', 'pointer']],
//     // Add: ['longlong', ['longlong', 'longlong']],
//     // Cosine: ['double', ['double']],
//     // Sort: ['void', [GoSlice]],
//     // Log: ['longlong', [GoString]]
//   });
//
//   setInterval(() => {
//     console.log('before 2');
//   }, 500);
//
//   await new Promise((resolve) => {
//     kalam.Initialize.async(function (err, res) {
//       resolve(res);
//     });
//   });
//
//   await new Promise((resolve) => {
//     kalam.FetchDeviceInfo.async(function (err, res) {
//       resolve(res);
//     });
//   });
//
//   let storageId = 0;
//
//   await new Promise((resolve) => {
//     kalam.FetchStorages.async(function (err, res) {
//       // if ( !isNullOrUndefined ( err ) ) {
//       //   console.log ( err );
//       // }
//       // if ( !isNullOrUndefined ( res ) ) {
//       //   console.log ( res );
//       // }
//
//       storageId = res;
//
//       resolve(res);
//     });
//   });
//
//   // const uploadFilescallback = ffi.Callback ( 'void', ['string', 'double'],
//   //   function( name, speed ) {
//   //     console.log ( 'Name: ', name );
//   //     console.log ( 'Speed: ', speed );
//   //   } );
//   //
//   // await new Promise ( ( resolve ) => {
//   //   kalam.UploadFiles.async ( uploadFilescallback, function( err, res ) {
//   //     if ( !isNullOrUndefined ( err ) ) {
//   //       console.log ( err );
//   //     }
//   //     if ( !isNullOrUndefined ( res ) ) {
//   //       console.log ( res );
//   //     }
//   //
//   //     resolve ( res );
//   //   } );
//   //
//   //   console.timeEnd ( 'Function #1' );
//   // } );
//
//   const walkCallback = ffi.Callback('void', ['string'], function (result) {
//     console.time('Function #1');
//     const json = JSON.parse(result);
//
//     console.timeEnd('Function #1');
//
//     console.log('result: ', json);
//   });
//
//   await new Promise((resolve) => {
//     kalam.Walk.async('/', storageId, walkCallback, function (err, res) {
//       if (!isNullOrUndefined(err)) {
//         console.log(err);
//       }
//       if (!isNullOrUndefined(res)) {
//         console.log(res);
//       }
//
//       resolve(res);
//     });
//   });
//
//   // const downloadFilesCallback = ffi.Callback ( 'void', ['string', 'double'],
//   //   function( name, speed ) {
//   //     console.log ( 'Name: ', name );
//   //     console.log ( 'Speed: ', speed );
//   //   } );
//   //
//   // await new Promise ( ( resolve ) => {
//   //   const sourceJson = JSON.stringify ( [
//   //     '/'
//   //   ] );
//   //
//   //   kalam.DownloadFiles.async ( sourceJson, '/path', downloadFilesCallback, function( err, res ) {
//   //     if ( !isNullOrUndefined ( err ) ) {
//   //       console.log ( err );
//   //     }
//   //     if ( !isNullOrUndefined ( res ) ) {
//   //       console.log ( res );
//   //     }
//   //
//   //     resolve ( res );
//   //   } );
//   //
//   //   console.timeEnd ( 'Function #1' );
//   // } );
//   //
//
//   setInterval(() => {
//     console.log('after');
//   }, 1000);
// }
//
// run();
