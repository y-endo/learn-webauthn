const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const mode = process.env.NODE_ENV !== 'production' ? 'development' : 'production';

module.exports = {
  mode: mode,
  devtool: mode === 'production' ? false : 'inline-source-map',
  entry: {
    index: './src/index.js'
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, './public/assets/js/')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src')
    },
    extensions: ['.js']
  },
  devServer: {
    open: false,
    contentBase: path.resolve(__dirname, './public'),
    watchContentBase: true,
    historyApiFallback: true,
    writeToDisk: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000'
      }
    }
  },
  optimization:
    mode === 'production'
      ? {
          minimizer: [
            new TerserPlugin({
              terserOptions: {
                ecma: 6,
                compress: {
                  warnings: false,
                  drop_console: true
                }
              }
            })
          ]
        }
      : {}
};
