'use strict';

/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import webpack from 'webpack';
import fs from 'fs';
import { dependencies as externals } from '../app/package.json';
import { dependencies as possibleExternals } from '../package.json';
import { _moduleAliases } from '../package.json';
import { PATHS } from '../app/utils/paths';

// Find all the dependencies without a `main` property and add them as webpack externals
function filterDepWithoutEntryPoints(dep) {
  // Return true if we want to add a dependency to externals
  try {
    // If the root of the dependency has an index.js, return true
    if (fs.existsSync(path.join(PATHS.nodeModules, `${dep}/index.js`))) {
      return false;
    }
    const pgkString = fs
      .readFileSync(path.join(PATHS.nodeModules, `${dep}/package.json`))
      .toString();
    const pkg = JSON.parse(pgkString);
    const fields = ['main', 'module', 'jsnext:main', 'browser'];
    return !fields.some(field => field in pkg);
  } catch (e) {
    console.error(e);
    return true;
  }
}

export default {
  externals: [
    ...Object.keys(externals || {}),
    ...Object.keys(possibleExternals || {}).filter(filterDepWithoutEntryPoints)
  ],

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
    },
    modules: [PATHS.app, 'node_modules']
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production'
    }),

    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

    new webpack.NamedModulesPlugin()
  ]
};
