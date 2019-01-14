'use strict';

/* eslint global-require: off,  */

/**
 * Builds the DLL for development electron renderer process
 */

import webpack from 'webpack';
import path from 'path';
import merge from 'webpack-merge';
import baseConfig from './config.base';
import { PATHS } from '../app/utils/paths';

const pkg = require('../package.json');

const dll = path.join(PATHS.root, 'dll');

export default merge.smart(baseConfig, {
  context: PATHS.root,
  devtool: 'eval',
  mode: 'development',
  target: 'electron-renderer',
  externals: ['fsevents', 'crypto-browserify'],

  /**
   * Use `module` from `config.renderer.dev.babel.js`
   */
  module: require('./config.renderer.dev.babel').default.module,

  entry: {
    renderer: Object.keys(pkg.dependencies || {})
  },

  output: {
    library: 'renderer',
    path: dll,
    filename: '[name].dev.dll.js',
    libraryTarget: 'var'
  },

  plugins: [
    new webpack.DllPlugin({
      path: path.join(dll, '[name].json'),
      name: '[name]'
    }),

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development'
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true,
      options: {
        context: PATHS.app,
        output: {
          path: dll
        }
      }
    })
  ]
});
