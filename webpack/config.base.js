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
      NODE_ENV: 'production',
      VERSION: JSON.stringify('Ganesh R')
    }),

    new webpack.DefinePlugin({
      /*  PKG_NAME: JSON.stringify(pkg.name),
      PKG_PRODUCT_NAME: JSON.stringify(pkg.productName),
      PKG_DESCRIPTION: JSON.stringify(pkg.description),
      PKG_AUTHOR: JSON.stringify(pkg.author),
      PKG_REPOSITORY: JSON.stringify(pkg.repository),
      PKG_HOMEPAGE: JSON.stringify(pkg.homepage) */
    }),

    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

    new webpack.NamedModulesPlugin()
  ]
};
