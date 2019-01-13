'use strict';

/**
 * Build config for electron renderer process
 */

import path from 'path';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import merge from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import baseConfig from './config.base';
import { PATHS } from '../app/utils/paths';

export default merge.smart(baseConfig, {
  devtool: 'source-map',
  mode: 'production',
  target: 'electron-renderer',
  entry: {
    client: ['./app/index.js']
  },

  output: {
    path: path.join(PATHS.app, 'dist'),
    publicPath: './dist/',
    filename: 'renderer.prod.js'
  },

  module: {
    rules: [
      // Extract all .global.css to style.css as is
      {
        test: /\.global\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: './'
            }
          },
          {
            loader: 'css-loader',
            options: {
              publicPath: './'
              // sourceMap: true
            }
          }
        ]
      },
      // Pipe other styles through css modules and append to style.css
      {
        test: /^((?!\.global).)*\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: './'
            }
          },
          {
            loader: 'css-loader',
            options: {
              publicPath: './',
              modules: true,
              localIdentName: '[name]__[local]__[hash:base64:5]'
              // sourceMap: true
            }
          }
        ]
      },
      // Add SASS support  - compile all .global.scss files and pipe it to style.css
      {
        test: /\.global\.(scss|sass)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: './'
            }
          },
          {
            loader: 'css-loader',
            options: {
              publicPath: './',
              // sourceMap: true,
              importLoaders: 1
            }
          },
          {
            loader: 'sass-loader',
            options: {
              publicPath: './'
              // sourceMap: true
            }
          }
        ]
      },
      // Add SASS support  - compile all other .scss files and pipe it to style.css
      {
        test: /^((?!\.global).)*\.(scss|sass)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: './'
            }
          },
          {
            loader: 'css-loader',
            options: {
              publicPath: './',
              modules: true,
              importLoaders: 1,
              localIdentName: '[name]__[local]__[hash:base64:5]'
              // sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              publicPath: './'
              // sourceMap: true
            }
          }
        ]
      },
      // WOFF Font
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            publicPath: './',
            limit: 10000, // kb
            mimetype: 'application/font-woff',
            name: 'fonts/[name].[hash].[ext]'
          }
        }
      },
      // WOFF2 Font
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            publicPath: './',
            limit: 10000,
            mimetype: 'application/font-woff',
            name: 'fonts/[name].[hash].[ext]'
          }
        }
      },
      // TTF Font
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            publicPath: './',
            limit: 10000,
            mimetype: 'application/octet-stream',
            name: 'fonts/[name].[hash].[ext]'
          }
        }
      },
      // EOT Font
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'file-loader',
          options: {
            publicPath: './',
            name: 'fonts/[name].[hash].[ext]'
          }
        }
      },
      // SVG Font
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            publicPath: './',
            limit: 10000,
            mimetype: 'image/svg+xml',
            name: 'images/[path][name].[hash].[ext]'
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

  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        sourceMap: true,
        cache: true
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          map: {
            inline: false,
            annotation: true
          }
        }
      })
    ]
  },

  plugins: [
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
      NODE_ENV: 'production'
    }),

    new MiniCssExtractPlugin({
      filename: 'style.css'
    }),

    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true'
    })
  ],

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false
  }
});
