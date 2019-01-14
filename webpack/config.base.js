'use strict';

/* eslint global-require: off */

/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import webpack from 'webpack';
import { PATHS } from '../app/utils/paths';
import { pkginfo } from '../app/utils/pkginfo';

export default {
  externals: [...Object.keys(JSON.stringify(pkginfo.dependencies) || {})],

  module: {
    rules: [
      {
        test: /\.(js|jsx)?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      }
    ]
  },

  output: {
    path: PATHS.app,
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2'
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@Log': path.resolve(__dirname, '../app/utils/log.js'),
      '@Alerts': path.resolve(__dirname, '../app/containers/Alerts/actions.js')
    }
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production'
    }),

    new webpack.DefinePlugin({}),

    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

    new webpack.NamedModulesPlugin()
  ]
};
