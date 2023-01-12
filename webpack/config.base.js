/* eslint global-require: off */

/**
 * Base webpack config used across other specific configs
 */

import { join } from 'path';
import webpack from 'webpack';
import { rootPath } from 'electron-root-path';
import { PATHS } from '../app/constants/paths';

const pkg = require(join(rootPath, 'package.json'));

export default {
  externals: [...Object.keys(pkg.dependencies || {})],

  module: {
    rules: [
      {
        test: /\.(js|jsx)?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
    ],
  },

  output: {
    path: PATHS.app,
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2',
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    modules: [PATHS.nodeModules],
  },

  plugins: [
    new webpack.IgnorePlugin({ resourceRegExp: /^(node-mac-permissions)$/u }),

    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),

    new webpack.DefinePlugin({
      PKG_INFO: {
        productName: JSON.stringify(pkg.productName),
        description: JSON.stringify(pkg.description),
        name: JSON.stringify(pkg.name),
        author: JSON.stringify(pkg.author),
        version: JSON.stringify(pkg.version),
        repository: JSON.stringify(pkg.repository),
        homepage: JSON.stringify(pkg.homepage),
        bugs: JSON.stringify(pkg.bugs),
      },
    }),
  ],
};
