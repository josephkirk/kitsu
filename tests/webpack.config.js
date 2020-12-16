module.exports = {
  mode: 'development',
  entry: './test-store.js',
  output: {
    path: __dirname,
    filename: 'test-bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 0aeab287 (Revert "Add electron")
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
<<<<<<< HEAD
=======
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
>>>>>>> 1de73864 (Add electron)
=======
>>>>>>> 0aeab287 (Revert "Add electron")
      }
    ]
  }
}
