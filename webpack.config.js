module.exports = {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  entry: './example/index.tsx',
  output: {
    filename: 'bundle.js'
  },
  devServer: {
    port: 8901
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' }
      }
    ]
  }
}
