var webpack = require('webpack');
var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	entry: './app/scripts/controllers/main.js',
	output: {
		path: __dirname + '/public',
		publicPath: '',
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: [
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader'
					},
					{
						loader: 'postcss-loader'
					},
					{
						loader: 'sass-loader'
					}
				]
			},
			{
				test: /\.(png|jpe?g|gif)$/i,
				use: [
					{
						loader: 'url-loader'
					}
				]
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			},
			{
				test: /\.css$/,
				use: {
					loader: 'css-loader'
				}
			},
			{
				test: /\.(woff2?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
				use: {
					loader: 'url-loader?limit=5000'
				}
			}
		]
	},
	plugins: [
		new webpack.ProvidePlugin({
			'jQuery': 'jquery',
			'$': 'jquery',
			'global.jQuery': 'jquery',
			'_': 'lodash',
			'toastr': 'toastr'
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: './app/img',
					to: './img' 
				},
				{
					from: './app/audio',
					to: './audio'
				}
			]
		})
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname)
		}
	}
};