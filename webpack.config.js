const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/demo/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: process.env.NODE_ENV === 'production' 
      ? '/s2polyline-ts/'
      : '/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/demo/index.html'
    }),
  ],
  devServer: {
    static: './dist',
    hot: true,
    historyApiFallback: true
  }
};
