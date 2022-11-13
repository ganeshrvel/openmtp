const webpack = require('webpack');

const PORT = 4644;

module.exports = {
  devtool: 'inline-source-map',
  devServer: {
    port: PORT,
    compress: true,
    hot: true,
    // writeToDisk: true,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin({
      multiStep: false,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(scss|css|sass)$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
    ],
  },
};
