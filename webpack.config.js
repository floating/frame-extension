const path = require('path')

module.exports = [
  {
    mode: 'production',
    entry: './src/frame.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'frame.js'
    },
    performance: {
      hints: false
    }
  },
  {
    mode: 'production',
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js'
    },
    performance: {
      hints: false
    }
  }
]
