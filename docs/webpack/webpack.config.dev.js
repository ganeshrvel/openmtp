'use strict';

const path = require('path');
const PORT = 4644;
const IS_DEV = process.env.NODE_ENV !== 'production';
const IS_PROD = process.env.NODE_ENV === 'production';

module.exports = {
  devServer: {
    port: PORT
  },
  plugins: [],
  module: {
    rules: [
      {
        test: /\.(scss|sass)$/,
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
      }
    ]
  }
};
