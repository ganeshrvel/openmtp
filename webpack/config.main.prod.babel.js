/**
 * Webpack config for production electron main process
 */

import webpack from 'webpack';
import merge from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import SentryWebpackPlugin from '@sentry/webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import baseConfig from './config.base';
import { PATHS } from '../app/constants/paths';

const { CleanWebpackPlugin } = require('clean-webpack-plugin');

export default merge(baseConfig, {
  devtool: 'source-map',
  mode: 'production',
  target: 'electron-main',
  entry: {
    client: ['./app/main.dev'],
  },

  output: {
    path: PATHS.root,
    filename: './app/main.prod.js',
  },

  optimization: {
    moduleIds: 'named',
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {},
        },
      }),
    ],
  },

  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [`${PATHS.dist}/*`],
    }),

    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true',
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
      NODE_ENV: 'production',
      DEBUG_PROD: false,
      START_MINIMIZED: false,
    }),

    new SentryWebpackPlugin({
      // sentry-cli configuration
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: 'ioganeshrvel',
      project: 'openmtp',
      urlPrefix: '~/app/dist',
      validate: true,
      configFile: '../sentry.properties',

      // webpack specific configuration
      include: '.',
      ignore: ['node_modules', 'config.renderer.prod.babel.js'],
    }),
  ],

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false,
  },
});
