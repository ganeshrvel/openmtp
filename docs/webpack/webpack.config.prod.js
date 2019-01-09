'use strict';

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const IS_DEV = process.env.NODE_ENV !== 'production';
const IS_PROD = process.env.NODE_ENV === 'production';
const rootPath = path.join(__dirname, '..', '..');
const buildPath = path.join(__dirname, '..');

module.exports = {
  plugins: [
    new CleanWebpackPlugin(
      [`${buildPath}/bundle/*`, `${buildPath}/index.html`],
      {
        root: rootPath
      }
    ),
    new MiniCssExtractPlugin({
      filename: 'bundle/[name].[contenthash].css'
    })
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  module: {
    rules: [
      {
        test: /\.(scss|css)$/,
        resolve: { extensions: ['.scss', '.css'] },
        use: [
          'style-loader',
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader?sourceMap'
        ]
      }
      // loaders: ['style-loader', 'css-loader', MiniCssExtractPlugin.loader]

      /*{
        test: /\.(scss|sass)$/,
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
              //sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              publicPath: './'
              //sourceMap: true
            }
          }
        ]
      }*/
    ]
  }
};
