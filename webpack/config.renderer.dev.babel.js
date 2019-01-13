'use strict';

/**
 * Build config for development electron renderer process that uses
 * Hot-Module-Replacement
 *
 * https://webpack.js.org/concepts/hot-module-replacement/
 */

import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import chalk from 'chalk';
import merge from 'webpack-merge';
import { spawn, execSync } from 'child_process';
import baseConfig from './config.base';
import { PATHS } from '../app/utils/paths';
import { PORT } from '../config/env';

const publicPath = `http://localhost:${PORT}/dist`;
const dll = path.resolve(PATHS.root, 'dll');
const manifest = path.resolve(dll, 'renderer.json');
const requiredByDLLConfig = module.parent.filename.includes(
  'config.renderer.dev.dll.babel'
);

/**
 * Warn if the DLL is not built
 */
if (!requiredByDLLConfig && !(fs.existsSync(dll) && fs.existsSync(manifest))) {
  console.info(
    chalk.black.bgYellow.bold(
      'The DLL files are missing. Sit back while we build them for you with "yarn build-dll"'
    )
  );
  execSync('yarn build-dll');
}

export default merge.smart(baseConfig, {
  devtool: 'inline-source-map',
  mode: 'development',
  target: 'electron-renderer',
  entry: [
    'react-hot-loader/patch',
    `webpack-dev-server/client?http://localhost:${PORT}/`,
    'webpack/hot/only-dev-server',
    path.join(PATHS.app, 'index.js')
  ],

  output: {
    publicPath: `http://localhost:${PORT}/dist/`,
    filename: 'renderer.dev.js'
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      },
      // Extract all .global.css to style.css as is
      {
        test: /\.global\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      },
      // Pipe other styles through css modules and append to style.css
      {
        test: /^((?!\.global).)*\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: true,
              importLoaders: 1,
              localIdentName: '[name]__[local]__[hash:base64:5]'
            }
          }
        ]
      },
      // SASS support - compile all .global.scss files and pipe it to style.css
      {
        test: /\.global\.(scss|sass)$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      // SASS support - compile all other .scss files and pipe it to style.css
      {
        test: /^((?!\.global).)*\.(scss|sass)$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: true,
              importLoaders: 1,
              localIdentName: '[name]__[local]__[hash:base64:5]'
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      // WOFF Font
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff'
          }
        }
      },
      // WOFF2 Font
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff'
          }
        }
      },
      // TTF Font
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/octet-stream'
          }
        }
      },
      // EOT Font
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: 'file-loader'
      },
      // SVG Font
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'image/svg+xml'
          }
        }
      },
      // Common Image Formats
      {
        test: /\.(?:ico|jpe?g|png|gif|webp)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'images/[path][name].[hash].[ext]'
            }
          }
        ]
      }
    ]
  },

  plugins: [
    requiredByDLLConfig
      ? null
      : new webpack.DllReferencePlugin({
          context: PATHS.root,
          manifest: require(manifest), // eslint-disable-line
          sourceType: 'var'
        }),

    new webpack.HotModuleReplacementPlugin({
      multiStep: false
    }),

    new webpack.NoEmitOnErrorsPlugin(),

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     *
     * By default, use 'development' as NODE_ENV. This can be overriden with
     * 'staging', for example, by changing the ENV variables in the npm scripts
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development'
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true
    })
  ],

  node: {
    __dirname: false,
    __filename: false,
    fs: 'empty'
  },

  devServer: {
    port: PORT,
    publicPath,
    compress: true,
    noInfo: true,
    stats: 'errors-only',
    inline: true,
    lazy: false,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    contentBase: path.join(PATHS.root, 'dist'),
    watchOptions: {
      aggregateTimeout: 300,
      ignored: /node_modules/,
      poll: 100
    },
    historyApiFallback: {
      verbose: true,
      disableDotRule: false
    },
    before() {
      if (process.env.START_HOT) {
        console.info('Starting Main Process...');
        spawn('npm', ['run', 'start-main-dev'], {
          shell: true,
          env: process.env,
          stdio: 'inherit'
        })
          .on('close', code => process.exit(code))
          .on('error', spawnError => console.error(spawnError));
      }
    }
  }
});
