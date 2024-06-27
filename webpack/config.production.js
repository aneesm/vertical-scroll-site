const entry = require('./entry');

module.exports = {
  entry,
  mode: 'production',
  devtool: 'source-map',
  output: {
    filename: 'app.js',
    path: '/src/js/'
  },
  performance: {
    hints: false
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ["@babel/preset-env"]
          }
        }]
      }
    ]
  },
  resolve: {
    extensions: [
      '.js'
    ]
  }
};
