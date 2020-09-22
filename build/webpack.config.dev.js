const merge = require('webpack-merge')
const commonConfig = require('./webpack.config.common')

const devConfig = {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  entry: './index.tsx',
  output: {
    filename: 'bundle.js',
  },
  devServer: {
    port: 8901,
    inline: true,
    historyApiFallback: true,
  },
}

module.exports = merge(commonConfig, devConfig)
