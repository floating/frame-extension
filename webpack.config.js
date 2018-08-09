const path = require('path')

module.exports = {
  mode: 'production',
  entry: './src/frame.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'frame.js'
  },
  performance: {
    hints: false
  }
}
