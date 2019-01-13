'use strict';

const path = require('path');
const webpack = require('webpack');

const PORT = 4644;
const buildPath = path.join(__dirname, '..', '..', 'docs', 'bundle');

module.exports = {
  devtool: 'inline-source-map',
  devServer: {
    contentBase: buildPath,
    port: PORT,
    compress: true,
    hot: true,
    watchOptions: {
      aggregateTimeout: 300,
      ignored: /node_modules/,
      poll: 100
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin({
      multiStep: false
    })
  ],
  module: {
    rules: [
      {
        test: /\.(scss|css|sass)$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'sass-loader'
          }
        ]
      }
    ]
  }
};
