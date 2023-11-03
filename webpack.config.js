const config = {
	mode: 'production',
	entry: {
		index: './src/scripts/index.js',
	},
	output: {
		filename: 'merged.js'
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			}
		]
	}
}

module.exports = config;
