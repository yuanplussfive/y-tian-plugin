module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/]
        },
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
   fallback: {
      "path": require.resolve("path-browserify")
    },
    extensions: ['.ts', '.tsx', '.js', '.vue']
  }
}