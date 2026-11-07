const path = require('path');

module.exports = {
  entry: './src/main.ts',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    libraryTarget: 'commonjs',
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  // تم إزالة أي إعدادات خاصة بـ externals لضمان دمج جميع حزم NestJS بالداخل
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};